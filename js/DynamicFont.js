// import WebFont from "webfontloader";
import * as DynamicSelectors from './selectors/DynamicSelectors.js';
import { DynamicUI } from "./DynamicUI.js";
class FontPreset {
    constructor(fontFamily, scale, lineHeight, letterSpacing) {
        this.fontFamily = fontFamily;
        this.scale = scale;
        this.lineHeight = lineHeight;
        this.letterSpacing = letterSpacing;
    }
}
//Font presets: font family _ scale _ line height _ letter spacing
// Agency FB/Style Script _ 1_1.45_1
// Ubuntu _0.88_1.35_-4.7
// Palette Mosaic _ 0.8 _ 1.3 _ -7.5
// TODO: cache all selectors
export class DynamicFont {
    constructor() {
        this.fontPresets = [];
        this.getFontRule = () => { var _a; return (_a = this.fontRule) !== null && _a !== void 0 ? _a : (this.fontRule = DynamicUI.insertEmptyRule(DynamicSelectors.fontSelectors)); };
        this.fontPresets = [
            new FontPreset('Agency FB', 1, 1.45, 1),
            new FontPreset('Ubuntu', 0.8, 1.4, 0.5),
            new FontPreset('Style Script', 1, 1.45, 2.3),
        ];
        this.currentFontPreset = this.fontPresets[0];
        this.applyCurrentFontPreset();
        this.$dropdownLabelFontFamily = $("#dropdown-font-family .dropdown-label");
        this.setupEvents();
    }
    applyCurrentFontPreset() {
        var _a, _b, _c, _d, _e;
        if (((_a = this.previousFontPreset) === null || _a === void 0 ? void 0 : _a.letterSpacing) != this.currentFontPreset.letterSpacing) {
            this.setRangeSliderValue("#range-slider_letter-spacing", this.currentFontPreset.letterSpacing);
            this.updateLetterSpacing();
        }
        if (((_b = this.previousFontPreset) === null || _b === void 0 ? void 0 : _b.lineHeight) != this.currentFontPreset.lineHeight) {
            this.setRangeSliderValue("#range-slider_line-height", this.currentFontPreset.lineHeight);
            this.updateLineHeight();
        }
        if (((_c = this.previousFontPreset) === null || _c === void 0 ? void 0 : _c.scale) != this.currentFontPreset.scale) {
            this.setRangeSliderValue("#range-slider_size-scale", this.currentFontPreset.scale);
            // restore to original size before scaling , meanwhile disable slider
            this.setSizeScale(1 / ((_e = (_d = this.previousFontPreset) === null || _d === void 0 ? void 0 : _d.scale) !== null && _e !== void 0 ? _e : 1));
            $("input#range-slider_size-scale ").prop('disabled', true);
            // add a delay to ensure finish restoring first
            setTimeout(() => {
                this.setSizeScale(this.currentFontPreset.scale);
                $("input#range-slider_size-scale ").prop('disabled', false);
            }, 300);
        }
    }
    //HELPER
    setRangeSliderValue(selector, value) {
        const $slider = $(selector);
        $slider.attr('value', value);
        $slider.next('.range-slider__value').html(value.toString());
    }
    setupEvents() {
        $("#dropdown-font-family .dropdown-item").each((index, element) => {
            $(element).on("click", (event) => {
                const fontName = $(element).text();
                this.$dropdownLabelFontFamily.text(fontName);
                this.loadFontByWebFontLoader(fontName);
            });
        });
        $("#font-panel ,range-slider input").on('input', (event) => {
            const newValue = event.target.value;
            $("#" + event.target.id).next('.range-slider__value').text(newValue);
            switch (event.target.id) {
                case 'range-slider_line-height':
                    this.currentFontPreset.lineHeight = parseFloat(newValue);
                    this.updateLineHeight();
                    break;
                case 'range-slider_letter-spacing':
                    this.currentFontPreset.letterSpacing = parseFloat(newValue);
                    this.updateLetterSpacing();
                    break;
                case 'range-slider_size-scale':
                    // restore to original size before scaling , meanwhile disable slider
                    this.setSizeScale(1 / this.currentFontPreset.scale);
                    $("input#range-slider_size-scale ").prop('disabled', true);
                    this.currentFontPreset.scale = parseFloat(newValue);
                    // add a delay to ensure finish restoring first
                    setTimeout(() => {
                        this.setSizeScale(this.currentFontPreset.scale);
                        $("input#range-slider_size-scale ").prop('disabled', false);
                    }, 300);
                    break;
            }
        });
    }
    setSizeScale(scale) {
        // 1: selectors for scaling can not be overlap, for e.g. if <span> text inside <p>, it will be scaled twice!
        //2: use relative units like rem
        // TOFIX: missing elements when try caching this JQuery<HTMLElement>
        $('h1,h2,h3,h4,h5,h6, p, .button, button, .title-wrapper, table th, table tbody, .badge-pill, label, .checkbox .name, .button i, input, textarea, small, a.dropdown-item').each((index, element) => {
            const $text = $(element);
            const currentSizeText = $text.css('font-size');
            const currentSize = parseFloat(currentSizeText.replace('px', ''));
            //TOFIX: this method leaves dirty rule traces
            $text.attr('style', function (i, s) { return (s || '') + `font-size: ${currentSize * scale}px !important;`; });
            // $text.css('font-size', `${currentSize * scale}px`);
        });
    }
    updateLetterSpacing() {
        this.getFontRule().style.setProperty('letter-spacing', `${this.currentFontPreset.letterSpacing / 100}rem`, 'important');
    }
    updateLineHeight() {
        this.getFontRule().style.setProperty('line-height', this.currentFontPreset.lineHeight.toString());
    }
    loadFontByWebFontLoader(fontFamily) {
        // @ts-ignore
        WebFont.load({
            google: {
                families: [fontFamily],
            },
            timeout: 2000,
            active: () => {
                this.applyFontFamily(fontFamily);
                let preset = this.getFontPresetByFamily(fontFamily);
                if (!preset) {
                    preset = new FontPreset(fontFamily, 1, 1.45, 1);
                    this.fontPresets.push(preset);
                }
                this.previousFontPreset = this.currentFontPreset;
                this.currentFontPreset = preset;
                this.applyCurrentFontPreset();
            },
            inactive: () => {
            }
        });
    }
    getFontPresetByFamily(fontFamily) {
        for (let i = 0; i < this.fontPresets.length; i++) {
            if (this.fontPresets[i].fontFamily == fontFamily) {
                return this.fontPresets[i];
            }
        }
        return null;
    }
    applyFontFamily(fontFamily) {
        this.getFontRule().style.setProperty('font-family', fontFamily, 'important');
    }
    loadFontByFontFace() {
        var junction_font = new FontFace('Palette Mosaic', 'url(https://fonts.googleapis.com/css2?family=Palette+Mosaic)', { style: 'bold', weight: '700' });
        junction_font.load().then(function (loaded_face) {
            console.log(' font loaded');
            $('h2').css('font-family', 'Palette Mosaic, cursive');
            document.fonts.add(loaded_face);
            document.body.style.fontFamily = '"Junction Regular", Arial';
        }).catch(function (error) {
            // error occurred
            // $('h2').css('font-family', 'Palette Mosaic, cursive');
            document.fonts.add(junction_font);
            document.body.style.fontFamily = '"Palette Mosaic", cursive';
            console.log(' failed');
        });
    }
}
