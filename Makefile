# Output Directory
OUT = build

# Input Files
JS = $(wildcard js/*.js)
CSS = $(wildcard css/*.css)
ASSETS = $(wildcard assets/*.svg)

# Output Files
oJS = $(addprefix $(OUT)/,$(JS))
oCSS = $(addprefix $(OUT)/,$(CSS))
oASSETS = $(addprefix $(OUT)/,$(ASSETS))

all: wishbanana
	@if [ -f deploy ]; then\
		./deploy;\
	fi

wishbanana: $(OUT)/index.html $(oJS) $(oCSS) $(oASSETS)

$(OUT)/index.html: index.html
	@mkdir -p $(OUT)
	cp $< $@

$(OUT)/js/%.js: js/%.js
	@mkdir -p $(OUT)/js
	cp $< $@

$(OUT)/css/%.css: css/%.css
	@mkdir -p $(OUT)/css
	cp $< $@

$(OUT)/assets/%.svg: assets/%.svg
	@mkdir -p $(OUT)/assets
	cp $< $@

clean:
	@if [ -d $(OUT) ]; then\
		rm $(OUT)/index.html;\
		rm -r $(OUT)/css;\
		rm -r $(OUT)/js;\
		rm -r $(OUT)/assets;\
	fi
