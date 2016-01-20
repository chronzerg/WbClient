# Output Directory
OUT = build

# Input Files
JS = $(shell find js/*.js ! -iname js/require.js)
CSS = $(shell find css/*.css)
ASSETS = $(shell find assets/*.svg)

# Output Files
oJS = $(OUT)/js/wishbanana.js $(OUT)/js/require.js
oCSS = $(addprefix $(OUT)/,$(CSS))
oASSETS = $(addprefix $(OUT)/,$(ASSETS))

all: wishbanana

wishbanana: $(OUT)/index.html

$(OUT)/index.html: $(OUT)/wishbanana.html $(oJS) $(oCSS) $(oASSETS)
	inliner $(OUT)/wishbanana.html > $(OUT)/index.html

$(OUT)/wishbanana.html: index.html
	mkdir -p $(OUT)
	cp index.html $(OUT)/wishbanana.html

$(OUT)/js/wishbanana.js: $(JS)
	r.js -o name=wishbanana out=$(OUT)/js/require.js paths.requireLib=require include=requireLib baseUrl=js useStrict=true

$(OUT)/js/require.js: js/require.js
	mkdir -p $(OUT)/js
	cp $< $@

$(OUT)/css/%.css: css/%.css
	mkdir -p $(OUT)/css
	cp $< $@

$(OUT)/assets/%.svg: assets/%.svg
	mkdir -p $(OUT)/assets
	cp $< $@

clean:
	if [ -d $(OUT) ]; then rm -r $(OUT); elif [ -f $(OUT) ]; then rm $(OUT); fi
