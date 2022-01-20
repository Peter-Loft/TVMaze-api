"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const ROOT_TVMAZE_URL = "https://api.tvmaze.com/";

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

/** accepts a user search term input, makes an api request to retrieve show data, and returns a result array of show objects with useful info
 */
async function getShowsByTerm(term) {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  let showsList = [];

  const response = await axios.get(`${ROOT_TVMAZE_URL}search/shows`, {
    params: { q: term },
  });

  const showsArray = response.data;

  showsArray.forEach((show) => {
    const { name, id, summary } = show.show;

    const showObj = {
      id,
      name,
      summary,
      image: show.show.image
        ? show.show.image.original
        : "https://tinyurl.com/tv-missing",
    };

    showsList.push(showObj);
  });

  return showsList;
}

/** Given list of shows, create markup for each and to DOM */

/** accepts the shows input, creates markup for each, and appends to DOM  */
function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src=${show.image} 
              alt=${show.name} 
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `
    );
    $showsList.append($show);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

$("#showsList").on("click", ".Show-getEpisodes", function (evt) {
  getEpisodesAndDisplay(evt.target);
});

/** Given a show ID, requests from API 
 * and returns (promise) array of episode objects
 */

async function getEpisodesOfShow(id) {
  const response = await axios.get(
    `${ROOT_TVMAZE_URL}shows/${id}/episodes
  `
  );

  const episodes = response.data;
  const episodesList = [];

  episodes.forEach((episode) => {
    const { name, id, season, number } = episode;

    const episodeObj = {
      name,
      id,
      season,
      number,
    };

    episodesList.push(episodeObj);
  });

  return episodesList;
}

/** Accepts array of objects, extracts info 
 * and appends to DOM with new li.
 * */

function populateEpisodes(episodes) {

  for (let episode of episodes) {
    const $episode = $(
      `<li data-episode-id="${episode.id}">
      ${episode.name} (season ${episode.season}, number ${episode.number})
      </li>`
    );
    $episodesArea.append($episode);
  }
  $episodesArea.show()
}

/** Accepts event.target, extracts id, calls functions to 
 * populate and display episodes.
*/
async function getEpisodesAndDisplay(evt) {
  let id = $(evt).parent().parent().parent().data("show-id");
  let episodes = await getEpisodesOfShow(id);
  populateEpisodes(episodes);
}