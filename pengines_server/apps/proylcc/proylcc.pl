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

put(Contenido, [RowN, ColN], PistasFilas, _PistasColumnas, Grilla, NewGrilla, FilaSat, 0):-
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
	
	buscaryComprobarF(NewGrilla,RowN,PistasFilas,FilaSat).

	
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%



%find encuentra el elemente en la posicion x y
%find comienza ubicando una lista en la matriz, R es el elemento en la posicion exacta
											
find(0,Yindex, [Xi|_Xs], R):-    			%cascara
		findsec(0,Yindex, Xi, R).

find(Xindex, Yindex, [_Xi|Xs], R):-
    	Xindex > 0,
    	XindexS is Xindex - 1,
    	find(XindexS, Yindex, Xs, R).


%findsec se encarga de buscar en la lista
	findsec(0, 0, [X|_Xs], X).

findsec(0, Yindex, [_Xi|Xs], R):-		
    	Yindex > 0,
    	YindexS is Yindex - 1,
    	findsec(0, YindexS, Xs, R).


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
comprobacionFilaFinal([],1).					%comprueba el final de la lista

comprobacionFilaFinal([X|Xs],R):-				%revisamos que el resto de espacios de la lista, este 
	X\=="#",
	comprobacionFilaFinal(Xs,R).

comprobacionFilaFinal([X|_Xs],0):-				%si encontramos algo pintado, despues de comprobar las pistas entonces 0
	X=="#".

comporbarFAux(P,[],[],0):-				%si llegamos al final de la fila, y aun no terminamos de comprobar P, entonces el resultado es 0
    P>0.

comporbarFAux(P,[X|_Xs],[],0):-				%si aun no terminamos de comprobar P, y nos encontramos algo no pintado entonces 0
    P>0,
    X\=="#".

comporbarFAux(0,LR,LR,_R).					%caso base, aun no podemos asegurar el valor de R

comporbarFAux(P,[X|Xs],ListaR,R):-			%avanzo en la "cadena" pintada descartando de la lista
    P>0,
    X=="#",
    Pi is P-1,
     comporbarFAux(Pi,Xs,ListaR,R).

buscarInicioF(P,[X|Xs],ListaR):-							%busca el inicio de una cadena pintada
	(X\=="#"),
	buscarInicioF(P,Xs,ListaR).

buscarInicioF(_P,[X|Xs],[X|Xs]):-								%Si enontre una "cadena" pintada, compruebo que cumpla con la pista
	X=="#".



buscarInicioF(_P,[],[]).										%si llegamos al final de la lista, devuelo una lista vacia

comprobarPista([],ListaR,R):-							%caso base, si no quedan pistas que comprobar, revisar que no halla nada extra pintado
    comprobacionFilaFinal(ListaR,R).

comprobarPista(_P,[],0).								%si ya tenemos el resultado, cortamos	
    
comprobarPista([P|SP],[X|Xs],R):-						%[P|SP] pista a comprobar, seguida del resto de pistas o vacio
	buscarInicioF(P,[X|Xs],ListAcomp),
    comporbarFAux(P,ListAcomp,ListR,R),
		comprobarPista(SP,ListR,R).

buscaryComprobarF([X|_Xs],0,PistasFilas,R):-				%CB
	comprobarPista(PistasFilas,X,R).

buscaryComprobarF([],_E,_PistasFilas,0).					%si la lista no se encontro probablemente halla un error

buscaryComprobarF([_X|Xs],RowN,PistasFilas,R):-				%RowN es la fila que vamos a comprobar
	RowN \= 0,												%Pistas Filas es la lista de pistas correspondiente
	RowNs is RowN-1,										%R 1 si cuple 0 si no cumple
	buscaryComprobarF(Xs,RowNs,PistasFilas,R).










	%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% columnaComoLista(+Grilla,+Yindex,,-ListaNueva)
%

% Caso base. Llegué al final de la matriz y me encuentro con la lista vacía.

columnaComoLista([],Yindex,[]).

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



	%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% agregarAlFinal(+Elem, +Lista, -NewLista)
%
	% Caso base
	agregarAlFinal(Elem, [], [Elem]).
	
	% Caso recursivo

	agregregarAlFinal(Elem, [L | Ls], [L | NewLs]) :- agregarAlFinal(Elem, Ls, NewLs).



	
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%



