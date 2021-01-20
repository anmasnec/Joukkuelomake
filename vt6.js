"use strict";


class App extends React.Component {
    constructor(props) {
      super(props);

      this.handleTeams = this.handleTeams.bind(this);


        // Käytetään samaa tietorakennetta kuin viikkotehtävässä 1, mutta vain jäärogainingin joukkueita
        // tehdään tämän komponentin tilaan kopio jäärogainingin tiedoista. Tee tehtävässä vaaditut lisäykset ja muutokset tämän komponentin tilaan
        // Tämä on tehtävä näin, että saadaan oikeasti aikaan kopio eikä vain viittausta samaan tietorakenteeseen. Objekteja ja taulukoita ei voida kopioida vain sijoitusoperaattorilla
        // päivitettäessä React-komponentin tilaa on aina vanha tila kopioitava uudeksi tällä tavalla
        // kts. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from
        let kilpailu = new Object();

        kilpailu.nimi = data.nimi;
        kilpailu.loppuaika = data.loppuaika;
        kilpailu.alkuaika = data.alkuaika;
        kilpailu.kesto = data.kesto;

        kilpailu.leimaustavat = Array.from( data.leimaustavat );
        kilpailu.rastit = Array.from( data.rastit );

        function kopioi_sarja(s) {
            let uusis = {};
            uusis.nimi = s.nimi;
            uusis.alkuaika = s.alkuaika;
            uusis.loppuaika = s.loppuaika;
            uusis.kesto = s.kesto;
            uusis.id = s.id;
            return uusis;
            
}
        function kopioi_joukkue(j) {
                    let uusij = {};
                    uusij.nimi = j.nimi;
                    uusij.id = j.id;
                    uusij.sarja = Array.from( j.sarja, kopioi_sarja);

                    uusij["jasenet"] = Array.from( j["jasenet"] );
                    uusij["rastit"] = Array.from( j["rastit"] );
                    uusij["leimaustapa"] = Array.from( j["leimaustapa"] );
                    return uusij;
        }


        kilpailu.sarjat = Array.from( data.sarjat, kopioi_sarja);
        kilpailu.sarjat.sort((a,b) => (a.nimi > b.nimi) ? 1 : ((b.nimi > a.nimi) ? -1 : 0));

        
        kilpailu.joukkueet = Array.from(data.joukkueet, kopioi_joukkue);
        kilpailu.joukkueet.sort((a,b) => (a.nimi > b.nimi) ? 1 : ((b.nimi > a.nimi) ? -1 : 0));


        // tuhotaan vielä alkuperäisestä tietorakenteesta rastit ja joukkueet niin
        // varmistuu, että kopiointi on onnistunut
        for(let i in data.rastit) {
            delete data.rastit[i];
        }  

        for(let i in data.joukkueet) {
                delete data.joukkueet[i];
        }
        
        for(let i in data.leimaustavat) {
                delete data.leimaustavat[i];
        } 

        for(let i in data.sarjat) {
                delete data.sarjat[i];
        } 

       

    this.state = {  "kilpailu": kilpailu,
                    "joukkueet": kilpailu.joukkueet,
                    "sarjat": kilpailu.sarjat,
                    "rastit": kilpailu.rastit,
                    "leimaustavat": kilpailu.leimaustavat
                };
        return;
    }

    //Luodaan uusi joukkue ja lisätään valmiina olevaan joukkuelistaan. Lisäyksen jälkeen järjestetään oikeaan järjestykseen
    handleTeams(joukkue)  {
      let members = [joukkue.member1, joukkue.member2, joukkue.member3, joukkue.member4, joukkue.member5];
      let jtaulukko = [];
      for (let i in members) {
          if (members[i] === "") {
              break;
          }
          else {
            jtaulukko.push(members[i]);
          }
      }
   
      let newTeam = {
          nimi : joukkue.name,
          sarja : joukkue.radio,
          id :  etsiSuurinId(this.state.kilpailu.joukkueet),
          jasenet : jtaulukko,           
          leimaustavat : joukkue.checkbox,                        
      };
      this.setState( { joukkueet : this.state.kilpailu.joukkueet.push(newTeam)} );
      this.setState({ joukkueet : this.state.kilpailu.joukkueet.sort((a,b) => (a.nimi.toLowerCase() > b.nimi.toLowerCase()) ? 1 : ((b.nimi.toLowerCase() > a.nimi.toLowerCase()) ? -1 : 0))});
      console.log(newTeam);
  }  


  //Luodaan sivulla näkyvät objektit. Käytetään seuraavia komponentteja
    render () {
      return ( 
      <div id="luoSivusto">
        <LisaaJoukkue handleTeams={this.handleTeams} series={this.state.kilpailu.sarjat} methods={this.state.kilpailu.leimaustavat}/>
        <ListaaJoukkueet handleTeams={this.handleTeams} teams={this.state.kilpailu.joukkueet}/>
        </div>
        );
    }

  }


    //Etsii suurimman vapaana olevan id:n joukkueelle
  function etsiSuurinId(teams) {
      let suurinId = teams[0].id;
      for(let i in teams) {
          if (suurinId < teams[i].id) suurinId = teams[i].id;
      }
      return (suurinId + 1);
    }
    
    
    class LisaaJoukkue extends React.Component {
      constructor(props) {
          super(props);
    
        // Lomakkeen sisältö muodostuu näiden pohjalta eli näiden on oltava tilassa
        this.state = {
            name : "",
            checkbox : [this.props.methods],
            radio : this.props.series[0].nimi,
            member1 : "",
            member2 : "",
            member3 : "",
            member4 : "",
            member5 : ""
            
        }
    
        this.handleChange = this.handleChange.bind(this);
            this.handleInsert = this.handleInsert.bind(this);
          }
          handleChange(event) {
          // dynaamisuuden takia pitää kikkailla erillisen objektin kautta:
          let obj = event.target;
          let arvo = obj.value;
          let kentta = obj.name;
          let type = obj.type;
          let checked = obj.checked;
          let validity = obj.validity;
          let newstate = {}; 
      
    
     // asetetaan virhe jos ei ole validi
        if ( validity.badInput || validity.patternMismatch || validity.rangeOverflow || validity.rangeUnderflow || validity.tooLong || validity.tooShort || validity.typeMismatch || validity.valueMissing  ) {
            console.log(event.target.validity);
            obj.setCustomValidity('Kentän arvo on virheellinen');
    
          // Ei nollata kontrolloidussa lomakkeessa
           newstate[kentta] = arvo;
           this.setState(newstate);
  
          return;
      }
      
      else {
          obj.setCustomValidity("");
    
      }

    

      // checkboxit pitää käsitellä erikseen, koska arvoja voi olla monta
      if ( type == "checkbox" ) {
        newstate[kentta] = this.state[kentta].slice(0); // tehdään kopio, koska alkuperäistä ei voi suoraan käyttää. Huom. tämä slice-temppu ei riitä, jos taulukossa on objekteja. Ei siis tee "deep" kloonia
        if ( checked) {
            // lisätään
            newstate[kentta].push(arvo);
        }
        else {
            // poistetaan
            newstate[kentta].splice(newstate[kentta].indexOf(arvo),1); 
        }
      
        obj.setCustomValidity("");
    
    }
    else {
    
            newstate[kentta] = arvo;
    
    }
    this.setState(newstate);
    
    }
    
    //Tarkistetaan ennen lisäystä onko joukkueella nimi sekä löytyykö vähintään kaksi jäsentä. Jos tiedot ovat oikein ilman virheitä tehdään lisäys
    handleInsert(event) {
      event.preventDefault();
      let kentat = ["name", "radio","member1","member2"];
      let virhe = 0;
      for ( let i of kentat ) {
            if (this.state[i] == "" || this.state[i].length  <= 1) {
                if (i == "name") {
                    this.refs.joukkueenNimi.setCustomValidity("Liian lyhyt joukkueen nimi"); //Käytetään refs-ominaisuutta, jotta päästään käsiksi vain tiettyihin arvoihin
                    virhe++;
                } else if (i == "member1") {
                    this.refs.member1.setCustomValidity("Liian lyhyt jäsenen nimi");
                    virhe++;
                } else {
                    this.refs.member2.setCustomValidity("Liian lyhyt jäsenen nimi");
                    virhe++;
                }
              }
      }
      
      if ( virhe === 0 ) {
         this.props.handleTeams(this.state)
          // nollataan lomake nollaamalla tila alkuperäiseksi

           let newstate = {
              name : "",
              radio : "radio1",
              checkbox : [this.props.methods],
              radio : this.props.series[0].nimi,
              member1 : "",
              member2 : "",
              member3 : "",
              member4 : "",
              member5 : ""
          }
          this.setState(newstate);

        }
    
}

    
    
    //Lomakkeen luominen
      render(){
        let methods = [];
        for(let i in this.props.methods) {
            methods.push(<label key={i} >{ this.props.methods[i] + ' ' }<input onChange={this.handleChange} type="checkbox" value={ this.props.methods[i] }  checked={this.state.checkbox.includes(this.props.methods[i]) } name="checkbox" /></label>);
        }
    
        let series = [];
        for(let i in this.props.series) {
            series.push(<label key={i} >{ this.props.series[i].nimi + ' ' }<input onChange={this.handleChange} type="radio" value={ this.props.series[i].nimi } checked={this.state.radio == this.props.series[i].nimi} name="radio" /></label>);
        }
    
        return (  
          <div id="luoLomake">
              <h2>Lisää joukkue</h2>
              <form method="post" onSubmit={this.handleInsert}>
                  <fieldset>
                      <legend>Joukkueen tiedot</legend>
                      <p className="lomake"><label htmlFor="name">Nimi</label><label><input onChange={this.handleChange} type="text" name="name"  value={this.state.name} ref ="joukkueenNimi" /></label></p>
                      <p className="lomake">
                          <label htmlFor="checkbox">Leimaustapa</label>
                          <label className="listainput">
                              { methods }
                          </label>
                      </p>
                      <p className="lomake">
                          <label htmlFor="radio">Sarja</label>
                          <label required="required" className="listainput">
                              { series }
                          </label>
                      </p>
                  </fieldset>
                  <fieldset>
                      <legend>Jäsenet</legend>
                      <p className="lomake"><label htmlFor="member1">Jäsen 1</label><label><input onChange={this.handleChange} type="text" name="member1"  value={this.state.member1} ref = "member1" /></label></p>
                      <p className="lomake"><label htmlFor="member2">Jäsen 2</label><label><input onChange={this.handleChange} type="text" name="member2"  value={this.state.member2} ref = "member2" /></label></p>
                      <p className="lomake"><label htmlFor="member3">Jäsen 3</label><label><input onChange={this.handleChange} type="text" name="member3"  value={this.state.member3} /></label></p>
                      <p className="lomake"><label htmlFor="member4">Jäsen 4</label><label><input onChange={this.handleChange} type="text" name="member4"  value={this.state.member4} /></label></p>
                      <p className="lomake"><label htmlFor="member5">Jäsen 5</label><label><input onChange={this.handleChange} type="text" name="member5"  value={this.state.member5} /></label></p>
                  </fieldset>
                  <button type="submit">Tallenna</button>
              </form>
          </div>
    )  
    }
    
    
    }
    
    //Komponentti joka renderöi yksittäisen joukkueen nimen
    class Joukkue extends React.Component {
      constructor(props) {
          super(props);
      };
    
      render() {
   
          return (
            <li>
            {this.props.team.nimi}
                      
        </li>
          )
      }
    }
    

    //Komponentti joka renderöi kaikki joukkueet
    class ListaaJoukkueet extends React.Component {
      constructor(props) {
          super(props);
          this.state = {
    
          };
      };
    
    
      render() {
          let teams = [];
          for (let i in this.props.teams) {
              teams.push(<Joukkue key={i} team={this.props.teams[i]} series={this.props.series} />);

          }
          return (
              <div id="lista">
                  <h2>Joukkueet</h2>
                  <ul>
                      {teams}
                  </ul>
              </div>
          )
      }
    }
    
    
    //varsinainen koko sovelluksen renderöinti
    ReactDOM.render(
      <div>
        <App />
        </div>,
      document.getElementById('root')
    
    );
    

















