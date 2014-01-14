
build: components index.js litebox.styl
	@component build --dev -c -o build -n build -u chameleon-stylus-plugin

components: component.json
	@component install --dev

clean:
	rm -fr build components template.js

.PHONY: clean
