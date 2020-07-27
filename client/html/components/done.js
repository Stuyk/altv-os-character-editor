Vue.component('tab-done', {
    props: ['data'],
    methods: {
        saveCharacter() {
            if (this.data.sex === 0) {
                this.data.facialHair = 29;
                this.data.facialHairColor1 = 0;
            }

            if ('alt' in window) {
                alt.emit('character:Done', this.data);
            }
        },
        discardCharacter() {
            if ('alt' in window) {
                alt.emit('character:Cancel');
            }
        },
        importCharacter() {
            const characterJSON = this.$refs.textarea.value;
            let character;
            try {
                character = JSON.parse(characterJSON);
            } catch (err) {
                this.$refs.textarea.value = `INVALID CHARACTER JSON CODE. RESETTING...`;

                if (this.timeout) {
                    clearTimeout(this.timeout);
                    this.timeout = null;
                }

                this.timeout = setTimeout(() => {
                    this.$refs.textarea.value = JSON.stringify(this.data, null, '\t');
                }, 2500);
                return;
            }

            Object.keys(character).forEach(key => {
                this.data[key] = character[key];
            });

            this.$root.$emit('updateCharacter');
            this.$root.$emit('resetSelection');
        },
        copyAll() {
            this.$refs.textarea.select();
            document.execCommand('copy');
        }
    },
    template: `
        <div class="options">
            <p>All finished designing your character?</p>
            <div class="option">
                <button class="full" @click="saveCharacter" style="margin-bottom: 12px">Save</button>
                <button class="full danger" @click="discardCharacter">Discard</button>
            </div>
            <div class="option">
                <div class="label">Character Code (Optional)</div>
                <textarea ref="textarea">{{ JSON.stringify(data, null, '\t') }}</textarea>
                <button class="full copy" @click="copyAll" style="margin-top: 12px">Copy Character Code</button>
                <button class="full copy" @click="importCharacter" style="margin-top: 12px">Import Code</button>
            </div>
            
        </div>
    `
});
