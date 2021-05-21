:- module(proylcc,
	[  
		put/8
	]).

:-use_module(library(lists)).


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% replace(?X, +XIndex, +Y, +Xs, -XsY)
%
% XsY es el resultado de reemplazar la ocurrencia de X en la posición XIndex de Xs por Y.

replace(X, 0, Y, [X|Xs], [Y|Xs]).

replace(X, XIndex, Y, [Xi|Xs], [Xi|XsY]):-
    XIndex > 0,
    XIndexS is XIndex - 1,
    replace(X, XIndexS, Y, Xs, XsY).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% put(+Contenido, +Pos, +PistasFilas, +PistasColumnas, +Grilla, -GrillaRes, -FilaSat, -ColSat).
%

put(Contenido, [RowN, ColN], PistasFilas, PistasColumnas, Grilla, NewGrilla, FilaSat, ColSat):-
	% NewGrilla es el resultado de reemplazar la fila Row en la posición RowN de Grilla
	% (RowN-ésima fila de Grilla), por una fila nueva NewRow.
	
	replace(Row, RowN, NewRow, Grilla, NewGrilla),

	% NewRow es el resultado de reemplazar la celda Cell en la posición ColN de Row por _,
	% siempre y cuando Cell coincida con Contenido (Cell se instancia en la llamada al replace/5).
	% En caso contrario (;)
	% NewRow es el resultado de reemplazar lo que se que haya (_Cell) en la posición ColN de Row por Conenido.	 
	
	

	(replace(Cell, ColN, _, Row, NewRow),
	Cell == Contenido 
		;
	replace(_Cell, ColN, Contenido, Row, NewRow)),
	
	buscarFila(NewGrilla,RowN,Fila),
	comprobarPista(PistasFilas,Fila,FilaSat),

	columnaComoLista(NewGrilla,ColN,Columna),
	comprobarPista(PistasColumnas,Columna,ColSat).

	
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%



%find encuentra el elemente en la posicion x y
%find comienza ubicando una lista en la matriz, R es el elemento en la posicion exacta
											
find(0,Yindex, [Xi|_Xs], R):-    			%cascara
		findEnColumna(0,Yindex, Xi, R).

find(Xindex, Yindex, [_Xi|Xs], R):-
    	Xindex > 0,
    	XindexS is Xindex - 1,
    	find(XindexS, Yindex, Xs, R).


%findEnColumna se encarga de buscar en la lista en el indice de columna Yindex.

	findEnColumna(0, 0, [X|_Xs], X).

findEnColumna(0, Yindex, [_Xi|Xs], R):-		
    	Yindex > 0,
    	YindexS is Yindex - 1,
    	findEnColumna(0, YindexS, Xs, R).


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
comprobacionFinal([],1).					%comprueba el final de la lista

comprobacionFinal([X|Xs],R):-				%revisamos que el resto de espacios de la lista, este 
	X\=="#",
	comprobacionFinal(Xs,R).

comprobacionFinal([X|_Xs],0):-				%si encontramos algo pintado, despues de comprobar las pistas entonces 0
	X=="#".

comporbarAux(P,[],[],0):-				%si llegamos al final de la lista, y aun no terminamos de comprobar P, entonces el resultado es 0
    P>0.

comporbarAux(P,[X|_Xs],[],0):-				%si aun no terminamos de comprobar P, y nos encontramos algo no pintado entonces 0
    P>0,
    X\=="#".

comporbarAux(0,[X|Xs],Xs,_R):-					%caso base, aun no podemos asegurar el valor de R y revise el elemento siguiente
	X\=="#".

comporbarAux(0,[],[],_R).

comporbarAux(0,[X|_Xs],[],0):-
	X=="#".

comporbarAux(P,[X|Xs],ListaR,R):-			%avanzo en la "cadena" pintada descartando de la lista
    P>0,
    X=="#",
    Pi is P-1,
     comporbarAux(Pi,Xs,ListaR,R).

buscarInicio(P,[X|Xs],ListaR):-							%busca el inicio de una cadena pintada
	(X\=="#"),
	buscarInicio(P,Xs,ListaR).

buscarInicio(_P,[X|Xs],[X|Xs]):-								%Si enontre una "cadena" pintada, compruebo que cumpla con la pista
	X=="#".

buscarInicio(_P,[],[]).										%si llegamos al final de la lista, devuelo una lista vacia



comprobarPista([],ListaR,R):-							%caso base, si no quedan pistas que comprobar, revisar que no haya nada extra pintado
    comprobacionFinal(ListaR,R).

comprobarPista([],[],0).								

comprobarPista(P,[],0):-								%si ya tenemos el resultado, cortamos	
    P\=[].
    
comprobarPista([P|SP],[X|Xs],R):-						%[P|SP] pista a comprobar, seguida del resto de pistas o vacio
	buscarInicio(P,[X|Xs],ListAcomp),
    comporbarAux(P,ListAcomp,ListR,R),
		comprobarPista(SP,ListR,R).

				%CB
	
%
% buscarFila(+Grilla,+RowN,-FilaRes) 			Busca y devuelve la fila que se encuentra en el indice RowN.
%

buscarFila([X|_Xs],0,X).	

buscarFila([_X|Xs],RowN,FilaRes):-				%RowN es la fila que vamos a comprobar
	RowN \= 0,												
	RowNs is RowN-1,										
	buscarFila(Xs,RowNs,FilaRes).






	%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% columnaComoLista(+Grilla,+Yindex,-ListaNueva)
%

% Caso base. Llegué al final de la matriz y me encuentro con la lista vacía.

columnaComoLista([],_Yindex,[]).

% Caso recursivo

columnaComoLista([G|Gs],Yindex,[Elem | Ls]):-

	% Yindex es el indice de la columna donde se encuentra el elemento
	% [G|Gs] es la grilla que hay que recorrer. Es decir, recorrer todas sus listas (hasta que Gs sea la
	% lista vacía)
	% [Elem | Ls] es la lista resultante de agregar el elemento Elem a la lista Ls.
	% Esta ultima lista Ls, es el resultado de la recursion del predicado.

	findEnColumna(0,Yindex,G,Elem),	% Recupero el elemento Elem busando en la lista G.

	columnaComoLista(Gs,Yindex,Ls).	
										% Ls es el resultado de ingresar el elemento con indice de columna
										% Yindex buscado en la lista Gs (fila que le sigue a la fila G.)
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

%
%EstadoDePistasGeneral(+Grilla,+PistasF,+PistasC,-ListaCumplidaF,-ListaCumplidaC)
%

estadoDePistasGeneral(Grilla,PistasF,PistasC,ListaCumplidaF,ListaCumplidaC):-
	%Grilla es el estado actual de la grilla del nonograma
	%PistasF pistas que se deben cumplir en las FilaSa
	%PistasC pistas que se deben cumplir en las columnaComoLista
	%ListaCumplidaF lista resultante de que pistas se cumplieron y cuales no
	%ListaCumplidaC lista resultante de que pistas se cumplieron y cuales no

	crearCumplidaF(Grilla,PistasF,ListaCumplidaF),
	crearCumplidaC(Grilla,PistasC,ListaCumplidaC).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%55
	
	crearCumplidaF([],[],[]).

	crearCumplidaF([X|Xs],[Y|Ys],[FilaSat|Cont]):-	%[X|Xs] Grlla,[Y|Ys] pistas
		comprobarPista(Y,X,FilaSat),
		crearCumplidaF(Xs,Ys,Cont).


	crearCumplidaCAux(_Grilla,[],_Yindex,[]).

	crearCumplidaCAux(Grilla,[Y|Ys],Yindex,[ColSat|Cont]):-
		columnaComoLista(Grilla,Yindex,Columna),
		comprobarPista(Y,Columna,ColSat),
		YindexS is Yindex + 1,
		crearCumplidaCAux(Grilla,Ys,YindexS,Cont).

	crearCumplidaC(Grilla,[Y|Ys],FilaPistaCSat):-			%cascara
		crearCumplidaCAux(Grilla,[Y|Ys],0,FilaPistaCSat).
