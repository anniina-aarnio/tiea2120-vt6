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
    let jasenkyselyidenMaara = { min: 2, max: 5};
    let tyhjaJasenkyselylista = [];
    for (let i = 0; i < jasenkyselyidenMaara.min; i++) {
        tyhjaJasenkyselylista.push("");
    }

    const [state, setState] = React.useState({
        "kilpailu": kopioi_kilpailu(data),
        "joukkue": {
            "nimi": "",
            "leimaustapa": [],
            "sarja": data.sarjat[0].id,
            "jasenet": tyhjaJasenkyselylista
        }
    });

    let leimaustavatMapNimiNumero = new Map();
    Array.from(state.kilpailu.leimaustavat).map((item, index) => {
        leimaustavatMapNimiNumero.set(item, index);
    });
    let leimaustavatMapNumeroNimi = new Map();
    Array.from(state.kilpailu.leimaustavat).map((item, index) => {
        leimaustavatMapNumeroNimi.set(index, item);
    });
    
    console.log( state.kilpailu );

    let valitseHandle = function(kohta, event) {
        if (kohta == "nimi") {

            // tarkistetaan validityt
            let validity = event.target.validity;
            let joukkueennimet = [];
            Array.from(state.kilpailu.joukkueet).map((item) => {
                joukkueennimet.push(item.nimi.trim().toLowerCase());
            });

            if (validity.badInput || validity.patternMismatch || validity.rangeOverflow || validity.rangeUnderflow || validity.tooLong || validity.tooShort || validity.typeMismatch || validity.valueMissing || !event.target.value.trim()) {
                event.target.setCustomValidity("Vähintään yksi merkki (ei välilyönti");
            } else if (joukkueennimet.includes(event.target.value.trim().toLowerCase())) {
                // jos muokatessa eri kuin alkuperäinen nimi
                if (event.target.value.trim().toLowerCase() != state.joukkue.alkuperainenNimi) {
                    event.target.setCustomValidity("Samanniminen joukkue on jo olemassa");
                }
            } else {
                event.target.setCustomValidity("");
            }
            handleChange(kohta, event.target.value);
        }
        else if (kohta == "sarja") {
            handleChange(kohta, event.target.id);
        }
        else if (kohta == "leimaustapa") {
            handleLeimaustavat(kohta, event.target);
        }
        else if (kohta == "jasenet") {
            handleJasenlista(kohta, event.target);
        }
    };

    /**
     * @param {String} kohta 
     * @param {Event.Target} eventTarget 
     */
    let handleLeimaustavat = function(kohta, eventTarget) {
        let objekti = eventTarget;

        let uudetCheckboxit = Array.from(state.joukkue[kohta]);

        // jos nyt klikattiin checkatuksi, lisätään listaan
        let leimaustapanimi = objekti.previousSibling.textContent;
        if (objekti.checked) {
            uudetCheckboxit.push(leimaustavatMapNimiNumero.get(leimaustapanimi));
                
            // muuten poistetaan listasta
        } else {
            uudetCheckboxit.splice(uudetCheckboxit.indexOf(leimaustavatMapNimiNumero.get(leimaustapanimi)), 1);
        }
        handleChange(kohta, uudetCheckboxit);
    };

    /**
     * ei poista tyhjää riviä alusta...
     * @param {String} kohta 
     * @param {Object} eventTarget 
     */
    let handleJasenlista = function(kohta, eventTarget) {
        // otetaan käsitellyn jäsenen indeksi ylös
        let index = parseInt((eventTarget.id).replace(/[^0-9]/g, '')) - 1;
        let uudetJasenet = Array.from(state.joukkue.jasenet);

        let nimi = eventTarget.value;
        let validity = eventTarget.validity;
        
        if (validity.badInput || validity.patternMismatch || validity.rangeOverflow || validity.rangeUnderflow || validity.tooLong || validity.tooShort || validity.typeMismatch || validity.valueMissing || !eventTarget.value.trim()) {
            console.log("sama nimi");
            eventTarget.setCustomValidity("Vähintään yksi merkki (ei välilyönti");
        } else if (uudetJasenet.includes(nimi.trim().toLowerCase())) {
            // jos muokatessa eri kuin alkuperäinen nimi
            eventTarget.setCustomValidity("Samanniminen jäsen on jo olemassa");
        } else {
            eventTarget.setCustomValidity("");
        }

        // tarkistetaan onko sillä indeksillä jo sisältöä
        // jos on: muutetaan sitä
        // jos ei ole: luodaan uusi
        if (uudetJasenet[index] == "" || uudetJasenet[index]) {
            uudetJasenet[index] = nimi;
        } else {
            uudetJasenet.push(nimi);
        }

        // onko nimi tyhjä? jos, niin poistetaan
        if (nimi == "") {
            uudetJasenet.splice(index, 1);
        }

        let jasenluku = uudetJasenet.length;
        let ekaTaiVikaTyhja = (uudetJasenet[jasenluku - 1].trim() == "" || uudetJasenet[0].trim() == "");

        if (!ekaTaiVikaTyhja && jasenluku < jasenkyselyidenMaara.max || jasenluku < jasenkyselyidenMaara.min) {
            uudetJasenet.push("");
        }

        handleChange(kohta, uudetJasenet);
    };

    /**
     * Tallentaa kyseisen sisällön annettuun kohtaan state.joukkueessa
     * @param {String} kohta 
     * @param {*} sisalto 
     */
    let handleChange = function(kohta, sisalto) {
        let uusistate = {...state};
        let uusijoukkue = {...uusistate.joukkue};
        uusijoukkue[kohta] = sisalto;
        uusistate.joukkue = uusijoukkue;
        setState(uusistate);
    };

    let aloitaMuokkaus = function(event) {
        let klikattuJoukkueID = event.target.id;
        // luodaan joukkue joka laitetaan stateen
        let etsitty = etsiObjektiIdnPerusteella(klikattuJoukkueID, state.kilpailu.joukkueet);
        let uusijoukkue = {...etsitty, sarja: etsitty.sarja.id, jasenet: [...etsitty.jasenet], leimaustapa: [...etsitty.leimaustapa]};
        if (uusijoukkue.jasenet.length < jasenkyselyidenMaara.max) {
            uusijoukkue.jasenet.push("");
        }

        // muokkausta ja nimen vertailua varten state.joukkue.alkuperainenNimi
        uusijoukkue.alkuperainenNimi = etsitty.nimi.trim().toLowerCase();

        let uusistate = {...state};
        uusistate.joukkue = uusijoukkue;

        setState(uusistate);
        
        console.log("aloitetaan muokkaus:", uusijoukkue);
    };

    let handleTallenna = function (event) {

        let kentat = ["nimi", "leimaustapa", "sarja", "jasenet"];
        let virheita = 0;
        for (let kentta of kentat) {
            if (state.joukkue[kentta] == "" || state.joukkue[kentta].length == 0) {
                virheita += 1;
                if (kentta == "sarja") {
                    // voisi tehdä validitycheckillä, mutta periaatteessa ei voi olla tyhjä
                    console.log("pitää olla valittuna vähintään yksi sarja");
                }
            }
        }


        // luodaan jäsenistä sopivampi lista
        let palautettavatJasenet = [];
        let jasenisto = Array.from(state.joukkue.jasenet);
        palautettavatJasenet = jasenisto.filter((item) => item.trim() != "");
        console.log(palautettavatJasenet);
        if (palautettavatJasenet.length < 2) {
            virheita += 1;
            // TODO pitäisi tehdä validityillä mutta ....
        }

        // varmistaa että validityt eivät herjaa
        if (!event.target.form.checkValidity() || virheita > 0) {
            console.log("virheitä", virheita);
            event.target.form.reportValidity();
            return;
        }

        // luo uuden joukkueen, jonka tiedot päivitetään vastaamaan formia
        let uusistate = {...state};
        let uusijoukkue = {...uusistate.joukkue};
        let uusidata = {...uusistate.kilpailu};
        let uusiJoukkuelistaus = Array.from(uusidata.joukkueet);

        uusijoukkue.sarja = etsiObjektiIdnPerusteella(uusijoukkue.sarja, state.kilpailu.sarjat);
        uusijoukkue.jasenet = palautettavatJasenet;

        // jos on muokattava joukkue ....
        if (uusijoukkue.id) {
            for (let joukkue of uusiJoukkuelistaus) {
                if (joukkue.id == uusijoukkue.id) {
                    vaihdaJoukkueenTiedot(joukkue, uusijoukkue);
                    joukkue = uusijoukkue;
                    console.log("löytyi!", joukkue);
                    break;
                }
            }
        // jos ei muokattava niin täytyy olla uusi
        } else {
            uusijoukkue.id = etsiIsoinID(Array.from(state.kilpailu.joukkueet)) + 1;
            uusijoukkue.rastileimaukset = [];
            uusiJoukkuelistaus.push(uusijoukkue);
        }

        let tyhjajoukkue = {
            "nimi": "",
            "leimaustapa": [],
            "sarja": data.sarjat[0].id,
            "jasenet": tyhjaJasenkyselylista
        };
        // state joukkueen tyhjennys
        uusistate.joukkue = tyhjajoukkue;

        // stateen päivitys
        uusidata.joukkueet = uusiJoukkuelistaus;
        uusistate.kilpailu = uusidata;
        setState(uusistate);


        console.log("tallenna", tyhjajoukkue);
    };



    /* jshint ignore:start */
    return (
        <div>
            <LisaaJoukkue
                change={valitseHandle}
                nimi={state.joukkue.nimi}
                tallenna={handleTallenna}
                leimaustavat={leimaustavatMapNimiNumero}
                sarjat={state.kilpailu.sarjat}
                checkedCheckboxes={state.joukkue.leimaustapa}
                selectedSarja={state.joukkue.sarja}
                jasenet={state.joukkue.jasenet}
                minJasenmaara={jasenkyselyidenMaara.min}/>
            <ListaaJoukkueet 
                joukkueet={state.kilpailu.joukkueet}
                leimaustavat={leimaustavatMapNumeroNimi}
                klikatessa={aloitaMuokkaus}/>
        </div>
    );
    /* jshint ignore:end */
};

const LisaaJoukkue = React.memo(function(props) {

    let handleInputMuutos = function(kohta, event) {
        props.change(kohta, event);
    };

    let handleLisaa = function(event) {
        event.preventDefault();
        console.log(event);
        props.tallenna(event);
    };

    /* jshint ignore:start */
    return (
        <form>
            <JoukkueenTiedot
                nimi={props.nimi}
                change={handleInputMuutos}
                leimaustavat={props.leimaustavat}
                checkedCheckboxes={props.checkedCheckboxes}
                sarjat={props.sarjat}
                selectedSarja={props.selectedSarja}/>
            <DynaamisetJasenet
                jasenet={props.jasenet}
                minJasenmaara={props.minJasenmaara}
                change={handleInputMuutos}/>
            <button onClick={handleLisaa}>Tallenna</button>
        </form>);
    /* jshint ignore:end */
});

const JoukkueenTiedot = React.memo(function JoukkueenTiedot(props) {

    let muutaNimea = function(event) {
        props.change("nimi", event);
    };
    
    let muutaInputinSisaltoa = function(kohta, event) {
        props.change(kohta, event);
    };

    /* jshint ignore:start */
    return (
        <fieldset>
            <legend>Joukkueen tiedot</legend>
            <label>Nimi
                <input type="text" value={props.nimi} required="required" onChange={muutaNimea} />
            </label>
            <div className="leimaustavat-kokonaisuus">
                <label>Leimaustavat</label>
                <CheckboxLista name="leimaustapa" change={muutaInputinSisaltoa} items={props.leimaustavat} type="checkbox" checked={props.checkedCheckboxes}/>
            </div>
            <div className="sarjat-kokonaisuus">
                <label>Sarjat</label>
                <SarjaLista name="sarja" change={muutaInputinSisaltoa} type="radio" items={props.sarjat} selected={props.selectedSarja} />
            </div>

        </fieldset>
    )
    /* jshint ignore:end */
});


const SarjaLista = React.memo(function SarjaLista(props) {
    let aakkostettu = Array.from(props.items).sort(aakkosjarjestysNimenMukaan);

    let muutaSisaltoa = function (event) {
        props.change(props.name, event);
    };

    /* jshint ignore:start */
    let listaus = [];
    let i = 0;
    for (let item of aakkostettu) {
        let rivi = (
            <label className="nimi-inputilla" key={item.id}>
                {item.nimi}
                <input
                    type={props.type}
                    name={props.name}
                    onChange={muutaSisaltoa}
                    checked={item.id == props.selected}
                    id={item.id}
                />
            </label>
        );
        listaus.push(rivi);
    }

    return (
        <span>
            <div>
                {listaus}
            </div>
        </span>
    );
    /* jshint ignore:end */
});

const CheckboxLista = React.memo(function CheckboxLista(props) {

    let aakkostetusti = Array.from(props.items.keys()).sort();
    let req = "";
    if (props.checked.length == 0) {
        req = "required";
    }

    let muutaSisaltoa = function (event) {
        props.change(props.name, event);
    };

    /* jshint ignore:start */
    let listaus = [];
    let i = 0;
    for (let nimi of aakkostetusti) {
        let rivi = (
            <label className="nimi-inputilla" key={i}>
                {nimi}
                <input
                    type={props.type}
                    name={props.name}
                    onChange={muutaSisaltoa}
                    checked={props.checked.includes(props.items.get(nimi))}
                    required={req}
                />
            </label>
        );
        i++;
        listaus.push(rivi);
    }

    return (
        <span>
            <div>
                {listaus}
            </div>
        </span>
    );
    /* jshint ignore:end */
});


const DynaamisetJasenet = React.memo( function DynaamisetJasenet(props) {

    // tarkistuksia varten jäsenet pienellä lista
    let jasenetPienella = Array.from(props.jasenet).map((item) => item.trim().toLowerCase());

    let muutaJasenta = function(event) {
        props.change("jasenet", event);
    };

    /* jshint ignore:start */
    // luo dynaamisesti oikean määrän jäsenkyselyrivejä
    let jasenKyselyt = [];
    for (let i = 1; i <= jasenetPienella.length; i++) {
        let req = "";
        if (i <= props.minJasenmaara) {
            req = "required";
        }
        let id = "jasen" + i;
        let rivi = (
            <label key={i}>Jäsen {i}
                <input type="text" id={id} value={props.jasenet[i-1]} required={req} onChange={muutaJasenta}/>
            </label>
        )
        jasenKyselyt.push(rivi);
    }


    return (
    <fieldset>
        <legend>Jäsenet</legend>
        {jasenKyselyt}
    </fieldset>
        
    );
    /* jshint ignore:end */
});


const ListaaJoukkueet = React.memo(function(props) {
    console.log("Listaa joukkueet: ", props);
    let joukkueetJarjestyksessa = Array.from(props.joukkueet).sort(aakkostaSarjanJaNimenMukaan);


    let handleClick = function(event) {
        // mitä tehdään kun klikkaa urlia   
        props.klikatessa(event); 
    };

    /* jshint ignore:start */
    let rivit = [];
    for (let joukkue of joukkueetJarjestyksessa) {
        let leimaustapalista = [];
        let aakkostettu = joukkue.leimaustapa.sort((a,b) => {
            if (props.leimaustavat.get(a) < props.leimaustavat.get(b)) {
                return -1
            } else if (props.leimaustavat.get(b) < props.leimaustavat.get(a)) {
                return 1;
            }
            return 0;
        });

        for (let lt of aakkostettu) {
            leimaustapalista.push(
                <li key={lt}>{props.leimaustavat.get(lt)}</li>);
        }

        let rivi = (
            // joukkueen tiedot oma komponenttinsa
            <JoukkueRivi key={joukkue.id} joukkue={joukkue} url="#" leimaustapalista={leimaustapalista} klikatessa={handleClick}/>
        );

        rivit.push(rivi);
    }

    return (
        <table>
            <thead>
                <tr>
                    <th>Sarja</th>
                    <th>Joukkue</th>
                    <th>Jäsenet</th>
                </tr>
            </thead>
            <tbody>
                {rivit}
            </tbody>
        </table>);
    /* jshint ignore:end */
});

const JoukkueRivi = React.memo(function JoukkueRivi(props) {
    let joukkue = props.joukkue;

    let handleKlikkaus = function (event) {
        props.klikatessa(event);
    };

    // TODO vaihda id={joukkue.id} sellaiseksi joka alkaa kirjaimella
    /* jshint ignore:start */
    return (
        <tr>
            <th>
                {joukkue.sarja.nimi}
            </th>
            <th>
                <div>
                    <a href={props.url} id={joukkue.id} onClick={handleKlikkaus}>{joukkue.nimi}</a>
                </div>
                <div>
                    <ul className="leimaustapalista">
                        {props.leimaustapalista}
                    </ul>
                </div>
            </th>
            <th>
                <JasenListaus jasenet={joukkue.jasenet}/>
            </th>
        </tr>
    )
    /* jshint ignore:end */
});

const JasenListaus = React.memo(function JasenListaus(props) {
    /* jshint ignore:start */
    let jasenet = Array.from(props.jasenet);
    jasenet.sort();

    return (
        <ul className="jasenlista">
            {jasenet.map((item, index) => {
                return <li key={index}>{item}</li>
            })}
        </ul>
    )
    /* jshint ignore:end */
});


const root = ReactDOM.createRoot( document.getElementById('root'));
root.render(
    /* jshint ignore:start */
    <React.StrictMode>
        <App />
    </React.StrictMode>
    /* jshint ignore:end */
);


// --------- APUFUNKTIOITA -----------------

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
        uusij["rastileimaukset"] = Array.from( j["rastileimaukset"], kopioi_leimaukset );
        uusij["leimaustapa"] = Array.from( j["leimaustapa"] );
        return uusij;
    }

    kilpailu.joukkueet = Array.from( data.joukkueet, kopioi_joukkue);
    return kilpailu;
}

/**
 * Vaihtaa vanhan joukkueen tiedot uuden joukkueen tietoihin
 * @param {Object} vanhaJoukkue 
 * @param {Object} uusiJoukkue 
 */
function vaihdaJoukkueenTiedot(vanhaJoukkue, uusiJoukkue) {
    let kohdat = ["nimi", "jasenet", "sarja", "leimaustapa"];
    for (let kohta of kohdat) {
        vanhaJoukkue[kohta] = uusiJoukkue[kohta];
    }
}

/**
 * Sorting-funktion apufunktio
 * Ottaa kaksi objektia, joilla on kenttä "nimi"
 * @param {Object} a 
 * @param {Object} b 
 * @returns 
 */
 function aakkosjarjestysNimenMukaan(a,b) {
    if (a.nimi < b.nimi) {
        return -1;
    } else if (b.nimi < a.nimi) {
        return 1;
    }
    return 0;
}

/**
 * Aakkostaa joukkueet ensisijaisesti sarjan nimen mukaan
 * toissijaisesti joukkueen nimen mukaan
 * Ei huomioi alun tai lopun whitespacea
 * Vertailee kaikki lowercasena
 * @param {Object} a ensimmäinen vertailtava joukkue 
 * @param {Object} b toinen vertailtava joukkue
 * @returns 
 */
function aakkostaSarjanJaNimenMukaan(a,b) {
    let asarja = a.sarja.nimi.trim().toLowerCase();
    let bsarja = b.sarja.nimi.trim().toLowerCase();
    let animi = a.nimi.trim().toLowerCase();
    let bnimi = b.nimi.trim().toLowerCase();

    if (asarja < bsarja) {
        return -1;
    }
    if (bsarja < asarja) {
        return 1;
    }
    if (animi < bnimi) {
        return -1;
    }
    if (bnimi < animi) {
        return 1;
    }
    return 0;

}

/**
 * Etsii objektin, jolla on objekti.id id-numeron perusteella.
 * Id on annettu merkkijonona
 * @param {String} id 
 * @return objekti
 */
function etsiObjektiIdnPerusteella(id, objektit) {
    for (let obj of objektit) {
        if (obj.id == id) {
            return obj;
        }
    }
}

/**
 * Etsii listan alkio.id seasta suurimman luvun ja lisää siihen yhden
 * Palauttaa etsityn luvun
 * @param {Array} lista 
 * @returns {Number} kokonaisluku, joka on isompi kuin listan yksikään id
 */
function etsiIsoinID(lista) {
    let uusiID = lista[0].id;
    for (let joukkue of lista) {
        if (joukkue.id > uusiID) {
            uusiID = joukkue.id;
        }
    }
    uusiID += 1;
    return uusiID;
}