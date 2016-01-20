# Output Directory
OUT = build

# Input Files
JS = $(shell find js/*.js ! -iname js/require.js)
CSS = $(shell find css/*.css)
ASSETS = $(shell find assets/*.svg)

# Output Files
oASSETS = $(addprefix $(OUT)/,$(ASSETS))

all: wishbanana

wishbanana: $(OUT)/index.html

$(OUT)/index.html: $(OUT)/wishbanana.html $(OUT)/js/require.js $(OUT)/css/wishbanana.css $(oASSETS)
	inliner $(OUT)/wishbanana.html > $(OUT)/index.html

$(OUT)/wishbanana.html: index.html
	@mkdir -p $(OUT)
	cp index.html $(OUT)/wishbanana.html

$(OUT)/js/require.js: $(JS)
	r.js -o name=wishbanana out=$(OUT)/js/require.js paths.requireLib=require include=requireLib baseUrl=js useStrict=true

$(OUT)/css/wishbanana.css: $(CSS)
	@mkdir -p $(OUT)/css
	css-concat css/wishbanana.css $(OUT)/css/wishbanana.css
	@# We prevent normalizeUrl because it strips the quotes from our inline SVG data.
	cssnano --no-normalizeUrl $(OUT)/css/wishbanana.css $(OUT)/css/wishbanana.css

$(OUT)/assets/%.svg: assets/%.svg
	@mkdir -p $(OUT)/assets
	cp $< $@

clean:
	@if [ -d $(OUT) ]; then\
		rm $(OUT)/wishbanana.html;\
		rm $(OUT)/index.html;\
		rm -r $(OUT)/css;\
		rm -r $(OUT)/js;\
		rm -r $(OUT)/assets;\
	fi
