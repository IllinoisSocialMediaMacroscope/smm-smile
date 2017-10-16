var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var path = require('path');
var crypto = require('crypto');
var util = require('util');

module.exports = function syncFolder(localFolderPath, remoteFolderPath, access_token) {

    const FOLDER_MIME = "application/vnd.google-apps.folder";

    var drive;

    loadCredentials(function () {
        createRemoteBaseHierarchy('root', function (folderId) {
            syncLocalFolderWithRemoteFolderId(localFolderPath, folderId);
        });
    });
	
    function loadCredentials(callback) {
        var oauth2Client = new OAuth2('***REMOVED***', 
											'***REMOVED***', 
											'http://localhost:8001/login/google/callback');
		oauth2Client.credentials = {'access_token':access_token};
		drive = google.drive({ version: 'v2', auth: oauth2Client });
		callback();
    }

    function createRemoteBaseHierarchy(parentId, callback) {
        var folderSegments = remoteFolderPath.split('/');

        var createSingleRemoteFolder = function (parentId) {
            var remoteFolderName = folderSegments.shift();

            if (remoteFolderName === undefined)
                // done processing folder segments - start the folder syncing job
                callback(parentId);

            else {
                var query = "(mimeType='" + FOLDER_MIME + "') and (trashed=false) and (title='" + remoteFolderName + "') and ('" + parentId + "' in parents)";

                drive.files.list({  // note: drive.children.list does not return needed children info (title/md5hash), so using drive.files.list instead
                    maxResults: 1,
                    q: query
                }, function (err, response) {
                    if (err) { console.log('The API returned an error: ' + err); return; }

                    if (response.items.length === 1) {
                        // folder segment already exists, keep going down...
                        var folderId = response.items[0].id;
                        createSingleRemoteFolder(folderId);

                    } else {
                        // folder segment does not exist, create the remote folder and keep going down...
                        drive.files.insert({
                            resource: {
                                title: remoteFolderName,
                                parents: [{ "id": parentId }],
                                mimeType: FOLDER_MIME
                            }
                        }, function (err, response) {
                            if (err) { console.log('The API returned an error: ' + err); return; }

                            var folderId = response.id;
                            console.log('+ /%s', remoteFolderName);
                            createSingleRemoteFolder(folderId);
                        });
                    }
                });
            }
        };

        createSingleRemoteFolder(parentId);
    }

    function syncLocalFolderWithRemoteFolderId(localFolderPath, remoteFolderId) {
        retrieveAllItemsInFolder(remoteFolderId, function (remoteFolderItems) {
            processRemoteItemList(localFolderPath, remoteFolderId, remoteFolderItems);
        });
    }

    function retrieveAllItemsInFolder(remoteFolderId, callback) {
        var query = "(trashed=false) and ('" + remoteFolderId + "' in parents)";

        var retrieveSinglePageOfItems = function (items, nextPageToken) {
            var params = { q: query };
            if (nextPageToken)
                params.pageToken = nextPageToken;

            drive.files.list(params, function (err, response) {
                if (err) {
                    invokeLater(err, function () {
                        retrieveAllItemsInFolder(remoteFolderId, callback);
                    });
                    return;
                }

                items = items.concat(response.items);
                var nextPageToken = response.nextPageToken;

                if (nextPageToken)
                    retrieveSinglePageOfItems(items, nextPageToken);

                else
                    callback(items);
            });
        }

        retrieveSinglePageOfItems([]);
    }

    function processRemoteItemList(localFolderPath, remoteFolderId, remoteFolderItems) {
        var remoteItemsToRemoveByIndex = []; // keeps track of remote items indexes that were not looked at / that can be deleted from the remote folder.
        for (var i = 0; i < remoteFolderItems.length; i++)
            remoteItemsToRemoveByIndex.push(i);

        // lists files and folders in localFolderPath
        fs.readdirSync(localFolderPath).forEach(function (localItemName) {
            var localItemFullPath = path.join(localFolderPath, localItemName);
            var stat = fs.statSync(localItemFullPath);

            var buffer;
            if (stat.isFile())
                // if local item is a file, puts its contents in a buffer
                buffer = fs.readFileSync(localItemFullPath);

            var remoteItemExists = false;

            for (var i = 0; i < remoteFolderItems.length; i++) {
                var remoteItem = remoteFolderItems[i];

                if (remoteItem.title === localItemName) { // local item already in the remote item list
                    if (stat.isDirectory())
                        // synchronizes sub-folders
                        syncLocalFolderWithRemoteFolderId(localItemFullPath, remoteItem.id);

                    else
                        // following function will compare md5Checksum and will update the file contents if hash is different
                        updateSingleFileIfNeeded(buffer, remoteItem);

                    remoteItemExists = true;

                    // item is in both local and remote folders, remove its index from the array
                    remoteItemsToRemoveByIndex = remoteItemsToRemoveByIndex.filter(function (value) { return value != i });  
                    break;
                }
            }

            if (!remoteItemExists)
                // local item not found in remoteFolderItems, create the item (file or folder)
                createRemoteItemAndKeepGoingDownIfNeeded(localItemFullPath, buffer, remoteFolderId, stat.isDirectory());
        });

        // removes remoteItems that are not in the local folder (ie not accessed previously)
        remoteItemsToRemoveByIndex.forEach(function (index) {
            var remoteItem = remoteFolderItems[index];
            deleteSingleItem(remoteItem);
        });
    }

    function updateSingleFileIfNeeded(buffer, remoteItem) {
        var md5sum = crypto.createHash('md5');
        md5sum.update(buffer);
        var fileHash = md5sum.digest('hex');

        if (remoteItem.md5Checksum === fileHash)
            console.log('= %s', remoteItem.title);

        else {
            // file already there, but different hash, upload new content!
            drive.files.update({
                fileId: remoteItem.id,
                media: { body: buffer }
            }, function (err, response) {
                if (err) {
                    invokeLater(err, function () {
                        updateSingleFileIfNeeded(buffer, remoteItem);
                    });
                    return;
                }

                console.log('^ %s', remoteItem.title);
            });
        }
    }

    function createRemoteItemAndKeepGoingDownIfNeeded(localItemFullPath, buffer, remoteFolderId, isDirectory) {
        var localItemName = path.basename(localItemFullPath);

        if (isDirectory && localItemName == ".svn")
            return;

        var itemToInsert = {
            resource: {
                title: localItemName,
                parents: [{ "id": remoteFolderId }]
            }
        };

        if (isDirectory)
            itemToInsert.resource.mimeType = FOLDER_MIME;

        else
            itemToInsert.media = { body: buffer };

        drive.files.insert(itemToInsert, function (err, response) {
            if (err) {
                invokeLater(err, function () {
                    createRemoteItemAndKeepGoingDownIfNeeded(localItemFullPath, buffer, remoteFolderId, isDirectory);
                });
                return;
            }

            console.log('+ %s%s', isDirectory ? '/' : '', localItemName);

            if (isDirectory)
                syncLocalFolderWithRemoteFolderId(localItemFullPath, response.id);
        });
    }

    function deleteSingleItem(remoteItem) {
        drive.files.delete({
            fileId: remoteItem.id
        }, function (err, response) {
            if (err) {
                invokeLater(err, function () {
                    deleteSingleItem(remoteItem);
                });
                return;
            }

            console.log('- %s', remoteItem.title);
        });
    }

    function invokeLater(err, method) {
        var rand = Math.round(Math.random() * 5000);
        //console.log('The API returned an error: ' + err + ' - retrying in ' + rand + 'ms');
        setTimeout(function () {
            method();
        }, rand);
    }
}

function dumpObjectToDisk(obj, filename) {
    var toString = util.inspect(obj, false, null);
    fs.writeFile(filename, toString, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("dumpObjectToDisk to '" + filename + "' completed");
    });
}