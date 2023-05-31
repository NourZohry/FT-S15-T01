const API_KEY = '04c19caa6e94d034f5b2e30a5b62cfdd';

let eventsMediator = {
    events: {},
    on: function (eventName, callbackfn) {
        this.events[eventName] = this.events[eventName]
            ? this.events[eventName]
            : [];
        this.events[eventName].push(callbackfn);
    },
    emit: function (eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(function (callBackfn) {
                callBackfn(data);
            });
        }
    },
};

let model = {
    page: 1,
    bestMovie: 0,

    showModal: false,
    modalMovie: null,
    movies: []
}

let controllerFooter = {
    init: function() {
        this.buttonInit();
    },
    buttonInit: function() {
        $("#previousButton").click(function (e) { 
            e.preventDefault();
            model.page = model.page == 1 ? 1 : model.page - 1;
            controller.getMovies(model.page);
        });
        $("#nextButton").click(function (e) { 
            e.preventDefault();
            model.page = model.page + 1;
            controller.getMovies(model.page);
        });
    }
}

controllerFooter.init();

let viewStats = {
    init: function () {
        this.render()
    },
    render: function() {
        $("#stats").empty();

        // console.log(model.movies);
        controllerStats.calculateBestMovie();

        let statsData = {
            "currentPage": model.page,
            "numberOfMovies": 20,
            "topMovie": model.movies[model.bestMovie].title,
            "topRating": model.movies[model.bestMovie].vote_average
        }

        let temp = document.getElementById("stats-template");
        const output = Mustache.render(temp.innerHTML, statsData);

        $("#stats").append(output);

    }
}

let controllerStats = {
    init: function () {
        viewStats.init();
    },
    calculateBestMovie: function () {
        let bestMovieIndex;
        let bestMovieRating = 0;

        for (let i = 0; i < model.movies.length; i++) {
            if (model.movies[i].vote_average > bestMovieRating) {
                bestMovieRating = model.movies[i].vote_average;
                bestMovieIndex = i;
            }
        }
        model.bestMovie = bestMovieIndex;
    }
}


let view = {
    render: function () {
        this.renderMovies();
        this.renderModal();
    },
    renderMovies: function () {
        $("#movies-container").empty();

        let temp = document.getElementById("movie-template");
        const output = Mustache.render(temp.innerHTML, model);

        $("#movies-container").append(output);


        $(".movie-card").each(function (movieIndex, movie) {
            $(movie).click(function (e) {
                e.preventDefault();
                eventsMediator.emit("movie-click", movieIndex);
            });
        });
    },
    renderModal: function () {
        if (model.showModal) {
            $("#modalBody").empty();

            // console.log(model);

            let temp = document.getElementById("modal-template");
            const output = Mustache.render(temp.innerHTML, model.movies[model.modalMovie]);

            $("#modalBody").append(output);
            $('#exampleModal').modal('toggle');
        }
    }
}

let controller = {
    init: function () {
        eventsMediator.on("movie-click", function (movieIndex) { controller.handleModal(movieIndex); });
        this.getMovies(1);
        // view.render();
    },
    getMovies: function (page) {

        $.ajax({
            type: "GET",
            url: "https://api.themoviedb.org/3/trending/movie/day?api_key=" + API_KEY + "&page=" + page,
            success: function (response) {
                // console.log(response.results);
                model.movies = response.results;
                view.render();

                controllerStats.init();

            },
            error: function (response) {
                console.log(response);
            }
        });
    },
    handleModal: function (movieIndex) {
        model.showModal = true;
        model.modalMovie = movieIndex;
        view.render();
    }
}

controller.init();


