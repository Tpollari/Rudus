const topNavigationSearchInputComponent = {
    template: '#top-navigation-search-input-template',
    emits: ['loading', 'error', 'results', 'search-page-url'],
    created() {
    },
    data() {
        return {
            translations: E21.TopNavigationSearch.Translations,
            searchPageBaseUrl: E21.TopNavigationSearch.SearchPageUrl,
            searchInput: '',
            searchTerm: '',
            results: null,
            loading: false,
            error: false,
        };
    },
    watch: {
        searchInput: _.debounce(function (value) {
            this.searchTerm = value.toLowerCase();
        }, 500),
        searchTerm: function () {
            if (this.validSearchTerm) {
                this.sendQuery();
            }
            else {
                this.results = null;
                this.loading = false;
            }
        },
        loading() {
            this.$emit('loading', this.loading);
        },
        error() {
            this.$emit('error', this.error);
        },
        results() {
            this.$emit('results', this.results);
        },
        searchPageUrl() {
            this.$emit('search-page-url', this.searchPageUrl);
        },
    },
    computed: {
        validSearchTerm: function () { return this.searchTerm && this.searchTerm.length > 1; },
        searchPageUrl: function () {
            var url = this.searchPageBaseUrl;
            if (this.validSearchTerm) {
                url += '?term=' + this.searchTerm;
            }
            return url;
        },
    },
    methods: {
        sendQuery() {
            if (this.validSearchTerm) {
                this.loading = true;
                const term = this.searchTerm;
                axios.get("/api/search?limit=5&term=" + term)
                    .then((response) => {
                    if (this.searchTerm == term) {
                        this.results = response.data;
                        this.loading = false;
                    }
                })
                    .catch((error) => {
                    this.loading = false;
                    this.error = true;
                });
                window.scrollTo(0, 0);
            }
        },
        searchClicked() {
            if (this.validSearchTerm && !this.loading) {
                window.location = this.searchPageUrl;
            }
        },
        clear() {
            this.searchInput = '';
            this.searchTerm = '';
        },
        blur() {
            document.body.style.overflow = '';
        },
        focus() {
            document.body.style.overflow = 'initial';
        },
    },
};
window.topNavigationSearchInputComponent = topNavigationSearchInputComponent;
const topNavigationSearchResultsComponent = {
    template: '#top-navigation-search-results-template',
    props: {
        loading: Boolean,
        error: Boolean,
        results: Object,
        searchPageUrl: String
    },
    created() {
    },
    data() {
        return {
            translations: E21.TopNavigationSearch.Translations,
        };
    },
    watch: {}
};
window.topNavigationSearchResultsComponent = topNavigationSearchResultsComponent;
