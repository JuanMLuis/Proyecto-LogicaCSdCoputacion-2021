import React from 'react';
import PengineClient from './PengineClient';
import Board from './Board';

class Game extends React.Component {

  pengine;

  constructor(props) {
    super(props);
    this.state = {
      grid: null,
      rowClues: null,
      colClues: null,
      waiting: false,
      mode: '#',
      PistasFilasSatisfechas: null,
      PistasColumnasSatisfechas: null,
      matrizSolucionada : null,     //importante: estado que almacena la matriz solucionada (si es que hay solucion).
      victoria : false,         
      modoPista :false,              //Estado que se togglea para revelar una celda clickeada.
      modoMostrarCompleta:false,     //Estado que se togglea para mostrar la solucion o la grilla original.
      cargando:true,                 //esta aparte del waiting para mostrar por pantalla que esta cargando y no aparezca cada vez que se hace consulta a prolog
      error:false 
    };
    this.handleClick = this.handleClick.bind(this);
    this.handlePengineCreate = this.handlePengineCreate.bind(this);
    this.pengine = new PengineClient(this.handlePengineCreate);
    this.cambioDeEstado = this.cambioDeEstado.bind(this);
    this.modoMostrarCompleta = this.modoMostrarCompleta.bind(this);
    this.modoPista = this.modoPista.bind(this);
   
  }

  handlePengineCreate() {
    const queryS = 'init(PistasFilas, PistasColumns, Grilla)';
    this.setState({
      waiting: true
    });
    this.pengine.query(queryS, (success, response) => {
      if (success) {
        let CantFilas=Object.keys(response['PistasFilas']).length;
        let CantColumnas=Object.keys(response['PistasColumns']).length;
        
        this.setState({
          grid: response['Grilla'],
          gridAux : response['Grilla'],
          rowClues: response['PistasFilas'],
     
          colClues: response['PistasColumns'],
          PistasFilasSatisfechas:new Array(CantFilas).fill(0),          //preguntar, inicializamos en 0, si no se inicializa aca, explota
          PistasColumnasSatisfechas: new Array(CantColumnas).fill(0),
          waiting:false
          
        });
      }else{
        this.setState({
          waiting: false
        });
      }
      this.inicializarPistasSat();
      this.inicializarMatrizSoluciones();
    });
  }


  /*
  * Método que inicializa los dos arreglos que llevan registro de si la columna (o fila) en la posicion i cumple con sus respectivas
  * pistas. 
  * Originalmente, se inicializan ambos arreglos con todos 0.
  */ 
  inicializarPistasSat(){   //inicializa los estados de las pistas por si alguna comienza en 1
   
  const squaresS = JSON.stringify(this.state.grid).replaceAll('"_"', "_");
   let PistasF= JSON.stringify(this.state.rowClues.slice());     
   let PistasC= JSON.stringify(this.state.colClues.slice());    
    
    const querySat='estadoDePistasGeneral('+squaresS+','+PistasF+','+PistasC+',ListaCumplidaF,ListaCumplidaC)'

    this.pengine.query(querySat, (success, response) => {
      if (success) {
        this.setState({
          PistasFilasSatisfechas:response['ListaCumplidaF'],
          PistasColumnasSatisfechas: response['ListaCumplidaC']

          
        });
       
      }
    });
  }

  /*
  * Inicializa una matriz con la solucion al nonograma. Se hace utilizando un predicado en prolog que devuelve una lista de listas
  * (matriz) que contiene en cada celda, un elemento que satisface correctamente las pistas, formando así, una solución valida.
  *
  */
  inicializarMatrizSoluciones(){

    let PistasF= JSON.stringify(this.state.rowClues.slice());
    let PistasC= JSON.stringify(this.state.colClues.slice()); 
    const queryMat='completarNonograma('+PistasF+','+PistasC+',GrillaR)'
    this.setState({
      waiting: true
    });

    /*Si la consulta es exitosa, el estado matrizSolucionada cambia a la grilla solucionada que viene como respuesta del predicado
    * de prolog
    */
    this.pengine.query(queryMat, (success, response) => {
      if (success) {
        this.setState({
          matrizSolucionada : response['GrillaR'],   //Almacena la grilla resuelta en matrizSolucionada.
          waiting: false,
          cargando :false
        });

      }this.setState({
        waiting: false,
        error:true
      });
    });
  }


  
  /*
  * Estado simple. Cada vez que se clickea el botón de estados, el onClick dispara este metodo que cambia el estado con el que se va
  * a pintar las celdas de la matriz.
  */

  cambioDeEstado(){
    if(!this.state.victoria){       //si la partida no termino, permito el cambio de modo
    
        if(this.state.mode==='#'){
        
            this.setState({mode:'X'})
        }
    else this.setState( {mode:'#'})
    }
  }

  
  

  handleClick(i, j) {
  
    // No action on click if we are waiting.
    if (this.state.waiting || this.state.cargando ||this.state.victoria) {
      return;
    }

    // Build Prolog query to make the move, which will look as follows:
    // put("#",[0,1],[], [],[["X",_,_,_,_],["X",_,"X",_,_],["X",_,_,_,_],["#","#","#",_,_],[_,_,"#","#","#"]], GrillaRes, FilaSat, ColSat)
   
    var posicion
    var squaresS = JSON.stringify(this.state.grid).replaceAll('"_"', "_");
    var squaresSAux;

    /*squaresSAux es una variable auxiliar. Esta sirve para guardar temporalmente la matriz de la que se quiere buscar el contenido
    * de la celda. En otras palabras: antes de colocar un elemento en la celda, hay que fijarse que tenia anteriormente.
    * Si el modo pista esta activo, lo que tenia anteriormente se busca en la matrizSolucionada, pero si resulta ser falso,
    * se busca en la matriz original.
    */

    if(this.state.modoPista === true){
     
      squaresSAux = JSON.stringify(this.state.matrizSolucionada).replaceAll('"_"', "_");
    
    }
    else{
      
      squaresSAux = JSON.stringify(this.state.grid).replaceAll('"_"', "_");
    
    }

    //Entonces, aquí al hacer el find, se obtiene "R", que es el elemento en la celda [i][j].

    const queryFind ='find('+ i + ',' + j + ','+squaresSAux+', R)'
    
    this.setState({
      waiting: true
    });

    this.pengine.query(queryFind, (success, response) => { 
      
      //Si la consulta es exitosa, se guarda el elemento que habia en la matriz en el estado "posicion"

      if (success) {
        
        posicion= response['R'];  // posicion guarda el la respuesta R, que es el elemento que contenia la celda.
        
        this.setState({
          waiting: false
        });

      } 
      else {
        
        this.setState({
          waiting: false
        });
      }

      /*Como ultimo, se agrega el elemento que se obtiene, pero se utiliza squaresS porque se debe reemplazar en la grilla original,
      * Esto delega la responsabilidad al metodo agregarElemento de fijarse si es un elemento agregado en modoPista o no.
      */

      this.agregarElemento(posicion,i,j,squaresS);
    }); 
  }
  

/*
* Agrega el elemento 'posicion' en la celda correspondiente a la posicion [i][j]. squaresS es la matriz a la cual se le quiere agregar
* el elemento, y es la variable que se utiliza para el predicado put/8 de prolog.
*/
agregarElemento(posicion,i,j,squaresS){ //se encarga de agregar el elemento que corresponda en la grilla
    let nuevoElem;
    let filaPista;
    let columnaPista;


    /*
    *En caso de que el modoPista sea false, la variable nuevoElem tendrá dos opciones posibles: si el estado posicion es igual al
    * estado del juego que nos encontramos (pintar o cruz), se debe quitar el contenido de la celda y dejarla en blanco.
    *  Si no son iguales posicion y this.state.mode, se coloca en la celda el estado en el que estamos (pintar o cruz).
    */

    if (this.state.modoPista === false){
      if(posicion === this.state.mode)
        nuevoElem='_'                   
        else
        nuevoElem='"'+this.state.mode+'"'
        

    }
    /*En caso de que el modoPista sea true, lo que se coloca en la celda es el contenido de la celda de la matrizSolucionada. 
    * En este particular caso, no se necesita cambiar nada, nuevoElem contiene lo mismo que la solucion.
    */
    else{
        nuevoElem = '"'+posicion+'"';
    }    
   
    let PistF = this.state.rowClues[i].toString();
    let PistC = this.state.colClues[j].toString();

    //Luego, el put es el mismo en cualquiera de los casos. Se coloca en la celda nuevoElem,
    const queryS = 'put('+nuevoElem+', [' + i + ',' + j + '], ['+PistF+'], ['+PistC+'],' + squaresS + ', GrillaRes, FilaSat, ColSat)';
    
    this.setState({
      waiting: true
    });

    this.pengine.query(queryS, (success, response) => {
      
      if (success) {
        
        filaPista = response['FilaSat'];  //El predicado put de prolog devuelve 1 si la fila está satisfecha. Se guarda en filaPista
        columnaPista= response['ColSat']  //El predicado put de prolog devuelve 0 si la columna está satisfecha. Se guarda en columnaPista
        
        this.setState({
          grid: response['GrillaRes'],   //La grilla original se actualiza con la grilla resultante del put/8 de prolog.
          waiting: false
        });
      
      } 
      else {
        
        this.setState({
          waiting: false
        });
      
      }

      //Consigo un arreglo que me dice que filas cumplen con sus pistas (y cuales no)
      
      let ArrayAuxFil = this.state.PistasFilasSatisfechas.slice(); 

      ArrayAuxFil[i]=filaPista   //A ese arreglo, le coloco la respuesta de FilaSat, que originalmente devolvía 1 si la fila cumplia con las pistas.
      
      this.setState({PistasFilasSatisfechas:ArrayAuxFil}); //Actualizo el arreglo de pistas satisfechas.

      //Analogamente, hago lo mismo con las columnas.
      let ArrayAuxCol = this.state.PistasColumnasSatisfechas.slice();
      ArrayAuxCol[j]=columnaPista
      this.setState({PistasColumnasSatisfechas:ArrayAuxCol});

      

      this.victoria();  //Cada vez que modifico una celda, debo verificar si llegue al estado de victoria.
      
    });
  
  }


  /*
  * Este metodo responde al onClick del botón que cambia entre mostrar la solucion o no. Cuando el toggle es true, se actualiza el estado
  * IMPORTANTE: tener en cuenta que para no tener un estado de más, cuando el estado modoMostrarCompleta es true,
  * solamente se actualiza el grid que se muestra en el render, es decir, se muestra la matriz completa. Cuando este estado es false,
  * se vuelve a mostrar la grilla original (this.state.grid).
  */

  modoMostrarCompleta(){
    if(!this.state.victoria && !this.state.cargando){
    
      let aux = this.state.modoMostrarCompleta;
      
      this.setState({
        modoMostrarCompleta: !aux
      })
    }
  }

  /*
  * Metodo analogo al modo de mostrar la solucion completa. Hace lo propio con el estado "modoPista".
  * Actualiza el estado, cambiando de verdadero a falso y viceversa cada vez que se activa o "dispara" el onClick.
  */

  modoPista(){
    if(!this.state.victoria && !this.state.cargando){
    
      let aux = this.state.modoPista;
    
      this.setState({
        modoPista: !aux
      })
   }
  
  }

  /*
  * Metodo que recorre tanto el arreglo de que lleva cuenta de aquellas filas que cumplen con sus pistas, asimismo como el de las columnas.
  * Si todas las filas y todas las columnas tienen un 1 en su posicion correspondiente en los arreglos, es porque simultaneamente
  * son correctas. Esto indica que se llegó al estado de victoria.
  */

  victoria(){
    let seguirRecorriendo = true;
    let arregloPistasFilasSat = this.state.PistasFilasSatisfechas;
    let arregloPistasColumnasSat = this.state.PistasColumnasSatisfechas;
    let i = 0;
    let r = 0;

    while( seguirRecorriendo){

      for( i; i < arregloPistasFilasSat.length; i++)
          if (arregloPistasFilasSat[i] === 0)
          seguirRecorriendo = false;
      

      if (seguirRecorriendo){

        for(r; r < arregloPistasColumnasSat.length; r++)
          if (arregloPistasColumnasSat[r] === 0)
          seguirRecorriendo = false;
      }

      if(seguirRecorriendo){
        this.setState({victoria : true});
        seguirRecorriendo = false;
      }
        
  }

}

  render() {
    if (this.state.grid === null) {
      return null;
    }

    let TextoVictoria
      if (this.state.victoria === true)
        TextoVictoria = 'Victoria!';
      else TextoVictoria="";

    let carga="";

    if(this.state.cargando && !this.state.error)
      carga="Cargando"
    else if(this.state.cargando && this.state.error)
      carga="ERROR NO HAY SOLUCION DISPONIBLE"

    
  
    
    return (
      <div className="game">
        <div> 
       </div>
        <Board
          grid={this.state.modoMostrarCompleta? this.state.matrizSolucionada :this.state.grid}
          rowClues={this.state.rowClues}
          colClues={this.state.colClues}
          PistasFSatisfechas={this.state.PistasFilasSatisfechas}
          PistasCSatisfechas={this.state.PistasColumnasSatisfechas}
          Boton={ <button type="button" className="box" onClick={this.cambioDeEstado} >{this.state.mode} </button> } //boton de cambio de estado
          Victoria={TextoVictoria}
          onClick={(i, j) => this.handleClick(i,j)}
        />
        <button type="button" className={"switch"+this.state.modoPista} onClick={this.modoPista} >{"Revelar celda"} </button>
        <button type="button" className={"switchG"+this.state.modoMostrarCompleta} onClick={this.modoMostrarCompleta} >{"Solucion"} </button>
        <div> {carga} </div>
    </div>
    );
  }
}

export default Game;
