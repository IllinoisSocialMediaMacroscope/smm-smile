WWWDIR = ../www

all:

install:
	@. /etc/environ.sh; \
		use -e -r node-6.11.2; \
		use -e -r python3.4; \
		cd ${WWWDIR}; \
		./install_libraries.sh;

clean:

distclean: clean
	rm -rf ${WWWDIR}/node_modules;
