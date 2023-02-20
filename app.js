let fanartArtists = [];
var headers = {};

async function Itunes(link) {
  // GET request using fetch with async/await
  fetch(link)
    .then((response) => response.json())
    .then((text) => {
      fanartArtists = text.results;
      let res = "<p>Itunes</p>";
      fanartArtists.forEach((element) => {
        res =
          res +
          `<div class="image"><img class="image" src="${element.artworkUrl60.replace(
            "60x60bb.jpg",
            "4000x4000.webp"
          )}" /></div>`;
      });
      // console.log(res)
      document.getElementById("itunes").innerHTML = res;
    });
}

async function Fanart(link, artist, album) {
  // GET request using fetch with async/await
  fetch(link)
    .then((response) => response.json())
    .then((text) => {
      fanartArtists = text;
      let res = "<p>FanArt</p>";
      let artists = [];
      fanartArtists.forEach((element) => {
        if (element.title.toLowerCase().indexOf(artist.toLowerCase()) != -1) {
          artists.push(element);
        }
      });
      artists.sort((a, b) => b.image_count - a.image_count);
      let fanartArtist = artists[0];
      linkSecond = fanartArtist.link + "?section=albumcover";
      fetch(linkSecond, {
        method: "GET",
        mode: "cors",
        headers: headers,
      })
        .then((res) => res.text())
        .then((text) => {
          const parser = new DOMParser();
          const parsedDocument = parser.parseFromString(text, "text/html");
          let search = parsedDocument.getElementsByClassName(
            "artwork activity-container albumcover"
          )[0];
          let fanartAlbums = [].slice.call(
            search.getElementsByClassName("imagecontainer albumcontainer")
          );
          fanartAlbums = fanartAlbums.filter((element) => {
            return (
              element.childNodes[0].attributes[0].nodeValue
                .toLowerCase()
                .indexOf(album.toLowerCase()) != -1
            );
          });
        //   console.log(fanartAlbums);
          fanartAlbums.forEach(
            (element) =>
              (res =
                res +
                `<div class="image"><img class="image" src="${element.childNodes[1].childNodes[3].childNodes[3].childNodes[1].href}" /></div>`)
          );
      document.getElementById("fanart").innerHTML = res;
        });
      // console.log(res)
    });
}

async function Bandcamp(link, artist, album) {
  fetch(link, {
    method: "GET",
    mode: "cors",
    headers: headers,
  })
    .then((res) => res.text())
    .then((text) => {
      const parser = new DOMParser();
      const parsedDocument = parser.parseFromString(text, "text/html");
      // console.log(parsedDocument)
      let ul = parsedDocument.getElementsByClassName("result-items")[0];
      if (ul == undefined) {
        document.getElementById("bandcamp").innerHTML = "";
      } else {
        let lis = ul.getElementsByTagName("li");
        var bandcampAlbums = [].slice.call(lis);
        // console.log(lis)
        let bca = [];
        bandcampAlbums.forEach((element) => {
          // console.log(element)
          let albumLink = element.getElementsByClassName("artcont")[0].href;
          // console.log(artLink.href)
          if (
            element
              .getElementsByClassName("heading")[0]
              .innerText.toLowerCase()
              .indexOf(album.toLowerCase()) != -1 &&
            element
              .getElementsByClassName("subhead")[0]
              .innerText.toLowerCase()
              .indexOf(artist.toLowerCase()) != -1
          ) {
            bca.push(albumLink);
          }
        });
        let res2 = "<p>Bandcamp</p>";
        bca.forEach((elm) => {
          elm = elm.substring(0, elm.indexOf("?fr"));
          // console.log(elm);
          fetch(elm, {
            method: "GET",
            mode: "cors",
            headers: headers,
          })
            .then((res) => res.text())
            .then((text2) => {
              const parser2 = new DOMParser();
              const parsedDocument2 = parser2.parseFromString(
                text2,
                "text/html"
              );
              const artLink =
                parsedDocument2.getElementsByClassName("popupImage")[0].href;
              res2 =
                res2 +
                `<div class="image"><img class="image" src="${artLink}" /></div>`;
              document.getElementById("bandcamp").innerHTML = res2;
            });
        });
        // document.getElementById('bandcamp').innerHTML = res2
      }
    });
}

document.getElementById("search").onsubmit = function () {
  let artist = document.getElementById("artist").value.toLowerCase();
  let album = document.getElementById("album").value.toLowerCase();

  let newArtist = artist.replace(" ", "+");
  let newAlbum = album.replace(" ", "+");
  let newText = newArtist.toLowerCase() + "+" + newAlbum.toLowerCase();
  let link =
    "https://itunes.apple.com/search?media=music&entity=album&limit=1000&term=" +
    newText;
  Itunes(link);
  newArtist = artist.replace(" ", "%20");
  newAlbum = album.replace(" ", "%20");
  newText = newArtist.toLowerCase() + "%20" + newAlbum.toLowerCase();
  link = "https://bandcamp.com/search?item_type=a&from=results&q=" + newText;
  // console.log(link);
  Bandcamp(link, artist, album);
  link = "https://fanart.tv/api/search.php?section=music&s=" + newText;
  Fanart(link, artist, album);

  return false;
};

document.getElementById("reset").addEventListener("click", function (event) {
  event.preventDefault();
  document.getElementById("artist").value = "";
  document.getElementById("album").value = "";
  document.getElementById("bandcamp").innerHTML = "";
  document.getElementById("itunes").innerHTML = "";
  document.getElementById("fanart").innerHTML = "";
});
