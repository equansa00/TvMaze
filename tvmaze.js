"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  try {
    const response = await axios.get(`http://api.tvmaze.com/search/shows`, {
      params: {
        q: term
      }
    });

    const shows = response.data.map((result) => {
      const showData = result.show;
      return {
        id: showData.id,
        name: showData.name,
        summary: showData.summary,
        image: showData.image ? showData.image.medium : "https://tinyurl.com/tv-missing"
      };
    });

    return shows;
  } catch (error) {
    console.error("Error fetching TV shows:", error);
    return [];
  }
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(`
      <div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
        <div class="card">
          <img src="${show.image}" class="card-img-top" alt="${show.name}">
          <div class="card-body">
            <h5 class="card-title">${show.name}</h5>
            <p class="card-text">${show.summary}</p>
            <button class="btn btn-primary Show-getEpisodes">Episodes</button>
          </div>
        </div>
      </div>
    `);

    $showsList.append($show);
  }
}

async function getEpisodesOfShow(id) {
  try {
    const response = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);
    return response.data.map((episode) => ({
      id: episode.id,
      name: episode.name,
      season: episode.season,
      number: episode.number
    }));
  } catch (error) {
    console.error("Error fetching episodes:", error);
    return [];
  }
}

function populateEpisodes(episodes) {
  $episodesArea.show();
  const $episodesList = $("#episodesList");
  $episodesList.empty();

  for (let episode of episodes) {
    const $episode = $(`<li>${episode.name} (Season ${episode.season}, Episode ${episode.number})</li>`);
    $episodesList.append($episode);
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
