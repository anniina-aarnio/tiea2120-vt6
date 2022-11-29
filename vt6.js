"use strict";
/* globals ReactDOM: false */
/* globals React: false */
/* globals data: false */
const App = function(props) {
        // Käytetään lähes samaa dataa kuin viikkotehtävässä 1
        // Alustetaan tämän komponentin tilaksi data.
        // Tee tehtävässä vaaditut lisäykset ja muutokset tämän komponentin tilaan
        // päivitettäessä React-komponentin tilaa on aina vanha tila kopioitava uudeksi
        // kopioimista varten on annettu valmis mallifunktio kopioi_kilpailu
        // huom. kaikissa tilanteissa ei kannata kopioida koko dataa
        const [state, setState] = React.useState({"kilpailu": kopioi_kilpailu(data) });
        console.log( state.kilpailu );

      /* jshint ignore:start */
      return (<div>
        <React.StrictMode>
          <h1>Lisää joukkue</h1>
	        <LisaaJoukkue tiedot={state.kilpailu}/>
	        <ListaaJoukkueet />
        </React.StrictMode>
        </div>);
      /* jshint ignore:end */
};

const LisaaJoukkue = function(props) {
      let leimaustavat = props.tiedot.leimaustavat;
      /* jshint ignore:start */
      return (
        <form>
          <fieldset>
            <legend>Joukkueen tiedot</legend>
            <label>Nimi 
              <input type="text"></input>
            </label>
            <Leimaustavat vaihtoehdot={leimaustavat} />
            <Sarjat vaihtoehdot={props.tiedot.sarjat} />
          </fieldset>
        </form>);
      /* jshint ignore:end */
};

const Leimaustavat = function(props) {
  /* jshint ignore:start */
  return (
    <div>
      <label>Leimaustavat</label>
      <div>
        <label>GPS
          <input type="checkbox" />
        </label>
      </div>
    </div>
  )
  /* jshint ignore: end */
};


const Sarjat = function(props) {

  console.log(props.vaihtoehdot);
  /*jshint ignore: start */
  return (
    <div>
      <label>Sarjat</label>
      <div>
        {props.vaihtoehdot.map((item) => {
          return <label key={item.id}>{item.nimi}
            <input type="radio" name="sarjaradio" />
          </label>
        })}
      </div>
    </div>
  )
  /*jshint ignore: end */
};

/**
 * Tätä voisi käyttää tyylillä:
 * <OtsikkoJaVaihtoehdot otsikko="Leimaustavat" inputType="checkbox" vaihtoehdot={leimaustavat} />
 * <OtsikkoJaVaihtoehdot otsikko="Sarja" inputType="radio" vaihtoehdot={sarjat} />
 * HUOM! checked radioon on vaikea toteuttaa tällä
 * @param {Object} props 
 * @returns 
 */
const OtsikkoJaVaihtoehdot = function(props) {
  let checked = props.checked;

  /* jshint ignore: start */
  return (
    <div>
      <label>{props.otsikko}</label>
      <div>
        {props.vaihtoehdot.map(function(item) {
          return <label key={item}>{item}
            <input type={props.inputType} name={props.otsikko}/>
          </label>
                })}
      </div>
    </div>
  )
  /* jshitn ignore: end*/
}


const ListaaJoukkueet = function(props) {
      /* jshint ignore:start */
      return (<table>
        </table>);
      /* jshint ignore:end */
};


const root = ReactDOM.createRoot( document.getElementById('root'));
root.render(
      /* jshint ignore:start */
    <App />,
      /* jshint ignore:end */
);

// datarakenteen kopioiminen
// joukkueen leimausten rasti on viite rastitaulukon rasteihin
// joukkueen sarja on viite sarjataulukon sarjaan
function kopioi_kilpailu(data) {
        let kilpailu = {};
        kilpailu.nimi = data.nimi;
        kilpailu.loppuaika = data.loppuaika;
        kilpailu.alkuaika = data.alkuaika;
        kilpailu.kesto = data.kesto;
        kilpailu.leimaustavat = Array.from( data.leimaustavat );
        let uudet_rastit = new Map(); // tehdään uusille rasteille jemma, josta niiden viitteet on helppo kopioida
        function kopioi_rastit(j) {
            	        let uusir = {};
            	        uusir.id = j.id;
            	        uusir.koodi = j.koodi;
            	        uusir.lat = j.lat;
            	        uusir.lon = j.lon;
 			uudet_rastit.set(j, uusir); // käytetään vanhaa rastia avaimena ja laitetaan uusi rasti jemmaan
            	        return uusir; 
        }
        kilpailu.rastit = Array.from( data.rastit, kopioi_rastit );
        let uudet_sarjat = new Map(); // tehdään uusille sarjoille jemma, josta niiden viitteet on helppo kopioida
        function kopioi_sarjat(j) {
            	        let uusir = {};
            	        uusir.id = j.id;
            	        uusir.nimi = j.nimi;
            	        uusir.kesto = j.kesto;
            	        uusir.loppuaika = j.loppuaika;
            	        uusir.alkuaika = j.alkuaika;
 			uudet_sarjat.set(j, uusir); // käytetään vanhaa rastia avaimena ja laitetaan uusi rasti jemmaan
            	        return uusir; 
        }
        kilpailu.sarjat = Array.from( data.sarjat, kopioi_sarjat );
        function kopioi_joukkue(j) {
                    let uusij = {};
                    uusij.nimi = j.nimi;
                    uusij.id = j.id;
            	    uusij.sarja = uudet_sarjat.get(j.sarja);

                    uusij["jasenet"] = Array.from( j["jasenet"] );
	            function kopioi_leimaukset(j) {
            	        let uusir = {};
            	        uusir.aika = j.aika;
            	        uusir.rasti = uudet_rastit.get(j.rasti); // haetaan vanhaa rastia vastaavan uuden rastin viite
            	        return uusir;
	            }
                    uusij["rastit"] = Array.from( j["rastileimaukset"], kopioi_leimaukset );
                    uusij["leimaustapa"] = Array.from( j["leimaustapa"] );
                    return uusij;
        }

        kilpailu.joukkueet = Array.from( data.joukkueet, kopioi_joukkue);
	return kilpailu;
}


