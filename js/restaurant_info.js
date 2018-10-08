import DBHelper from "./dbhelper";
import format from "date-fns/format";

let restaurant;
var newMap;
let self = {};

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener("DOMContentLoaded", event => {
  initMap();
});

/**
 * Initialize leaflet map
 */
const initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) {
      // Got an error!
      console.error(error);
    } else {
      self.newMap = new L.Map("map", {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer(
        "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}",
        {
          mapboxToken:
            "pk.eyJ1IjoicnJqb3NvbiIsImEiOiJjamx4aHA4Y2owYXUyM3dtY2E3M2lxODFpIn0.kxpNETYtrRDiOihkJGy-eg",
          maxZoom: 18,
          attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          id: "mapbox.streets"
        }
      ).addTo(self.newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
const fillRestaurantHoursHTML = (
  operatingHours = self.restaurant.operating_hours
) => {
  const hours = document.getElementById("restaurant-hours");
  Object.keys(operatingHours).forEach(key => {
    const row = document.createElement("tr");

    const day = document.createElement("td");
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement("td");
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  });
};

/**
 * Create review HTML and add it to the webpage.
 */
const createReviewHTML = review => {
  const li = document.createElement("li");
  const name = document.createElement("p");
  name.innerHTML = review.name;
  li.appendChild(name);

  const createdAt = document.createElement("p");
  createdAt.innerHTML = format(review.createdAt, "MMMM D, YYYY");

  li.appendChild(createdAt);

  const rating = document.createElement("p");
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement("p");
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
const fillReviewsHTML = (reviews = DBHelper.getReviews(self.restaurant.id)) => {
  const container = document.getElementById("reviews-container");
  const title = document.createElement("h3");
  title.innerHTML = "Reviews";
  container.appendChild(title);

  const ul = document.getElementById("reviews-list");
  reviews
    .then(reviewsData => {
      reviewsData.forEach(rev => {
        ul.insertBefore(createReviewHTML(rev), ul.firstChild);
      });
    })
    .catch(() => {
      const noReviews = document.createElement("p");
      noReviews.innerHTML = "No reviews yet!";
      container.appendChild(noReviews);
    });
  container.appendChild(ul);
};

/**
 * Create restaurant HTML and add it to the webpage
 */
const fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById("restaurant-name");
  name.innerHTML = restaurant.name;

  const address = document.getElementById("restaurant-address");
  address.innerHTML = restaurant.address;

  const image = document.getElementById("restaurant-img");
  image.className = "restaurant-img";
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = restaurant.name;

  const cuisine = document.getElementById("restaurant-cuisine");
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
};

/**
 * Get current restaurant from page URL.
 */
const fetchRestaurantFromURL = callback => {
  if (self.restaurant) {
    // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  const id = getParameterByName("id");
  if (!id) {
    // no id found in URL
    error = "No restaurant id in URL";
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant);
    });
  }
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
const fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById("breadcrumb");
  const li = document.createElement("li");
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
const getParameterByName = (name, url) => {
  if (!url) url = window.location.href;
  const modifiedName = name.replace(/[\[\]]/g, "\\$&");
  const regex = new RegExp(`[?&]${modifiedName}(=([^&#]*)|&|#|$)`);
  const results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return "";
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};

/**
 * Submit and validate review form
 */
window.createReview = () => {
  // Access the form element...
  var form = document.getElementById("review-form");

  // ...and take over its submit event.
  form.addEventListener("submit", function(event) {
    event.preventDefault();

    addReview();
  });
};

const addReview = () => {
  const author = document.getElementById("review-author").value;
  const comment = document.getElementById("review-comment").value;
  const rating = document.querySelector("#rating-values-list option:checked")
    .value;

  const reviewData = {
    restaurant_id: self.restaurant.id,
    rating: parseInt(rating),
    name: author,
    comments: comment,
    createdAt: new Date()
  };

  if (!navigator.onLine) {
    const errorField = document.getElementById("review-form-error");
    errorField.classList.add("warning");
    errorField.innerHTML = `You are currently Offline!`;
  }
  DBHelper.postReview(reviewData);
  document.getElementById("review-form").reset();

  const ul = document.getElementById("reviews-list");
  ul.insertBefore(createReviewHTML(reviewData), ul.firstChild);
};
