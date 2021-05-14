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

put(Contenido, [RowN, ColN], PistasFilas, _PistasColumnas, Grilla, NewGrilla, Filasat, 0):-
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
	replace(_Cell, ColN, Contenido, Row, NewRow)).

	
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
comprobacionFilaFinal([]).					%comprueba el final de la lista

comprobacionFilaFinal([X|Xs]):-
	X\="#",
	comprobacionFilaFinal(Xs).

comporbarFAux(0,LR,LR).

comporbarFAux(P,[X|Xs],ListaR):-			%avanzo en la "cadena" pintada descartando de la lista
    P>0,
    X=="#",
    Pi is P-1,
    comporbarFAux(Pi,Xs,ListaR).
    

buscarInicioF(P,[X|Xs],ListR):-				%Si enontre una "cadena" pintada, compruebo que cumpla con la pista
	X=="#",
	comporbarFAux(P,[X|Xs],ListR).

buscarInicioF(P,[X|Xs],ListaR):-			%busca el inicio de una cadena pintada
	(X\="#"),
	buscarInicioF(P,Xs,ListaR).

comprobarPistaFila([],ListaR):-					%caso base, si no quedan pistas que comprobar, revisar que no halla nada extra pintado
	comprobacionFilaFinal(ListaR).
    
comprobarPistaFila([P|SP],[X|Xs]):-			%[P|SP] pista a comprobar, seguida del resto de pistas o vacio
	buscarInicioF(P,[X|Xs],ListR),
		comprobarPistaFila(SP,ListR).

buscaryComprobarF([X|_Xs],0,PistasFilas):-
	comprobarPistaFila(PistasFilas,X).

buscaryComprobarF([_X|Xs],RowN,PistasFilas):-
	RowN \= 0,
	RowNs is RowN-1,
	buscaryComprobarF(Xs,RowNs,PistasFilas).