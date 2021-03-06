//флажок на цвет
//флажок на выбранную фигуру

var socket = io.connect('http://localhost:8888/'); //('http://192.168.1.108:8080/'); - для игры с разных компов

/*
 pawn - пешка
 rook - ладья
 khight - конь
 bitshop - слон
 queen - ферзь
 king - король
 */
//пути к иконкам
pathToLight = 'figures/light/White';
pathToDark = 'figures/dark/Black';

//пешки
var blackPawn = '<img color="black" type="pawn" src="'+pathToDark+' P.ico">';
var whitePawn = '<img color="white" type="pawn" src="'+pathToLight+' P.ico">';
//ладьи
var blackRook = '<img color="black" type="rook" src="' + pathToDark + ' R.ico">';
var whiteRook = '<img color="white" type="rook" src="' + pathToLight + ' R.ico">';
//кони
var blackKnight = '<img color="black" type="knight" src="' + pathToDark + ' N.ico">';
var whiteKnight = '<img color="white" type="knight" src="' + pathToLight + ' N.ico">';
//слоны
var blackBitshop = '<img color="black" type="bitshop" src="' + pathToDark + ' B.ico">';
var whiteBitshop = '<img color="white" type="bitshop" src="' + pathToLight + ' B.ico">';
//ферзи
var blackQueen = '<img color="black" type="queen" src="' + pathToDark + ' Q.ico">';
var whiteQueen = '<img color="white" type="queen" src="' + pathToLight + ' Q.ico">';
//короли
var blackKing = '<img color="black" type="king" src="' + pathToDark + ' K.ico">';
var whiteKing = '<img color="white" type="king" src="' + pathToLight + ' K.ico">';



checked = false; //изначально нет выбранной фигуры

//Создание доски
function CreateBoard (boardHeight, boardWidth) {
	var board = $('#board');
	for (var i = 0; i < boardHeight; i++) {
		for (var j = 0; j < boardWidth; j++) {
			if ((i % 2 == 0 && j % 2 == 0) || (i % 2 != 0 && j % 2 != 0)) {
				board.append ($('<div class="lightCell"> </div>').attr("x",i+1).attr("y",j+1));
			} else {
				board.append ($('<div class="darkCell"> </div>').attr("x",i+1).attr("y",j+1));
            }
		}
	}
}

function ClearBoard() {
    for (var x = 1; x < 9; x++) {
        for (var y = 1; y < 9; y++) {
            Point (x,y,0,0).children().hide();
            Point (x,y,0,0).removeClass('attack').removeClass('navigate').removeClass('castling');
        }
    }
}

//расстановка фигур
function Dotting () {

    cell = $(".whiteCell,.darkCell");

    /*
     pawn - пешка
     rook - ладья
     khight - конь
     bitshop - слон
     queen - ферзь
     king - король
     */

     //InsertFigure (7,1,blackRook); //удалить

    for (var i = 1; i < 9; i++) {
        for (var j = 1; j < 9; j++) {
            //пешки
            if (i == 2) {
                InsertFigure(i,j,whitePawn);
            }
            else if (i == 7) {
                InsertFigure (i,j,blackPawn);
            }
            //белые фигуры первого ряда
            else if (i == 1) {
                if (j == 1 || j == 8)  {
                    InsertFigure(i,j, whiteRook);
                }
                else if (j == 2 || j == 7) {
                    InsertFigure(i,j,whiteKnight);
                }
                else if (j == 3 || j == 6) {
                    InsertFigure (i, j, whiteBitshop);
                }
                else if (j == 4) {
                    InsertFigure (i, j, whiteQueen);
                }
                else if (j == 5) {
                    InsertFigure(i,j,whiteKing);
                }
            }
            //черные фигуры восьмого ряда
            else if (i == 8) {
                if (j == 1 || j == 8)  {
                    InsertFigure(i,j, blackRook);
                }
                else if (j == 2 || j == 7) {
                    InsertFigure(i,j,blackKnight);
                }
                else if (j == 3 || j == 6) {
                    InsertFigure (i, j, blackBitshop);
                }
                else if (j == 4) {
                    InsertFigure (i, j, blackQueen);
                }
                else if (j == 5) {
                    InsertFigure(i,j,blackKing);
                }
            }
        }
    }

//добавил id каждой фигуре
    for (var i = 1; i < 9; i++) {
        for (var j = 1; j < 9; j++) {
            Point(i,j,0,0).children().attr('id',i.toString()+j);
        }
    }

}

//проверка на наличие в массиве
function in_array(value, array) 
{
    for(var i = 0; i < array.length; i++) 
    {
        if(array[i] == value) return true;
    }
    return false;
}

//x,y - координаты, где стоит король, param - действие
function HideShowKing (x, y, param) {
    if (param == 'h') {
        Point (x,y,0,0).children().hide();
    } else if (param == 's') {
        Point (x,y,0,0).children().show();
    }
    
}



//проверка ячейки на допустимость хода короля (из-за шаха)
//x хода, y хода, цвет короля
function ShahCheckBeforeKingMove(x,y,currentColor) {
    var _x = x;
    var _y = y;

    for (i = 1; i < 9; i++) {
        for (j = 1; j < 9; j ++) {
            if (Point(i,j,0,0).children().attr('type') == 'king') {
                if (Point(i,j,0,0).children().attr('color') == 'white') {
                    var xCordWhiteKing = i;
                    var yCordWhiteKing = j;
                } 
                else {
                    var xCordBlackKing = i;
                    var yCordBlackKing = j;
                }
            }
        }
    }


    var xCordOfCheckedKing;
    var yCordOfCheckedKing; 
    var _color;

    if (currentColor == 'white') {
        _color = 'black';
        xCordOfCheckedKing = xCordWhiteKing;
        yCordOfCheckedKing = yCordWhiteKing;        
    } else {
        _color = 'white';
        xCordOfCheckedKing = xCordBlackKing;
        yCordOfCheckedKing = yCordBlackKing;
    }



    for (var i = 1; i < 9; i++) {
        for (var j = 1; j < 9; j++) {
            if ((!IsEmpty(Point(i,j,0,0))) && (Point(i,j,0,0).children().attr('color') == _color)) {
                var fType = Point(i,j,0,0).children().attr('type');
                if (fType != 'king') {
                    HideShowKing(xCordOfCheckedKing, yCordOfCheckedKing, 'h'); //скрываем короля
                    Navigate(parseInt(i),parseInt(j),fType,_color); //прокладываем путь для каждой фигуры цвета агрессора
                    if (Point(_x,_y,0,0).hasClass('navigate')) {
                        RemoveClasses();
                        HideShowKing(xCordOfCheckedKing,yCordOfCheckedKing,'s');
                        return true;
                    }
                }
                RemoveClasses();
                HideShowKing(xCordOfCheckedKing,yCordOfCheckedKing,'s');
            }
        }
    }
    return false;
}


//функция для проверки длины пути до агрессора
//параметры - координаты короля под атакой
function CheckPathLength (x_k, y_k, x_a, y_a) { 
    var lengthOfPath = 0;
    var protectCells = [];

//js не видит while-loop :D

    while ((x_k != x_a) || (y_k != y_a)) {

        if (x_k < x_a) {
            x_k++;
        } 
        else if (x_k > x_a) {
            x_k--;
        }

        if (y_k < y_a) {
            y_k++;
        }
        else if (y_k > y_a) {
            y_k--;
        }

        if (Point(x_k,y_k,0,0).hasClass('navigate')) {
            protectCells.push(x_k.toString() + y_k);
            lengthOfPath++;
        }
    }

    cellsCanMoveWhenShah = protectCells.slice(0); //копируем массив
    cellsCanMoveWhenShah.push(x_a.toString() +y_a); //фигура-агрессов всегда доступна для атаки
    return lengthOfPath;
}

//передаем цвет фигуры-акгрессора и её координаты
function MateCheck (color_a, x_a, y_a) {
    var type_a = Point(x_a, y_a, 0,0).children().attr('type'); //тип фигуры агрессора
    var cell_a = Point(x_a, y_a, 0,0); //ячейка агрессора

    for (i = 1; i < 9; i++) {
        for (j = 1; j < 9; j ++) {
            if (Point(i,j,0,0).children().attr('type') == 'king') {
                if (Point(i,j,0,0).children().attr('color') == 'white') {
                    var xCordWhiteKing = i;
                    var yCordWhiteKing = j;
                } 
                else {
                    var xCordBlackKing = i;
                    var yCordBlackKing = j;
                }
            }
        }
    }

    var goalCellsOfKing = []; //массив для возможных ходов короля

    var xCordOfAttackedKing;
    var yCordOfAttackedKing;

    //длины путей до и после защиты
    var pathLengthBeforeProtect; 
    var pathLengthAfterProtect;

    //var cellsCanAttackWhenShah = [];

    if (color_a == 'white') { //если цвет агрессора белый, то атакуемых король - черный
        xCordOfAttackedKing = xCordBlackKing;
        yCordOfAttackedKing = yCordBlackKing;
    } else {
        xCordOfAttackedKing = xCordWhiteKing;
        yCordOfAttackedKing = yCordWhiteKing;

    }   

    //запоминаем теоритически возможные для хода ячейки  
    if (IsEmpty(Point (xCordOfAttackedKing, yCordOfAttackedKing, 1, 0))) {
        if (xCordOfAttackedKing + 1 < 9) { //если координата не выходит за пределы поля
            var goalCell1 = Point (xCordOfAttackedKing, yCordOfAttackedKing, 1, 0); //если клетка пустая
            goalCellsOfKing.push(goalCell1);   //добавляем целевую ячейку короля в массив 
        }       
    }

    if (IsEmpty(Point (xCordOfAttackedKing, yCordOfAttackedKing, 1, 1))) {
        if (xCordOfAttackedKing + 1 < 9 && yCordOfAttackedKing + 1 < 9) {
            var goalCell2 = Point (xCordOfAttackedKing, yCordOfAttackedKing, 1, 1);
            goalCellsOfKing.push(goalCell2);    
        }
    }

    if (IsEmpty(Point (xCordOfAttackedKing, yCordOfAttackedKing, 0, 1))) {
        if (yCordOfAttackedKing + 1 < 9) {
            var goalCell3 = Point (xCordOfAttackedKing, yCordOfAttackedKing, 0, 1);
            goalCellsOfKing.push(goalCell3);   
        }        
    }

    if (IsEmpty(Point (xCordOfAttackedKing, yCordOfAttackedKing, -1, 1))) {
        if (xCordOfAttackedKing - 1 > 0 && yCordOfAttackedKing + 1 < 9) {
            var goalCell4 = Point (xCordOfAttackedKing, yCordOfAttackedKing, -1, 1);
            goalCellsOfKing.push(goalCell4);  
        }      
    }

    if (IsEmpty(Point (xCordOfAttackedKing, yCordOfAttackedKing, -1, 0))) {
        if (xCordOfAttackedKing - 1 > 0) {
            var goalCell5 = Point (xCordOfAttackedKing, yCordOfAttackedKing, -1, 0); 
            goalCellsOfKing.push(goalCell5);   
        }
    }

    if (IsEmpty(Point (xCordOfAttackedKing, yCordOfAttackedKing, -1, -1))) {
        if (xCordOfAttackedKing - 1 > 0 && yCordOfAttackedKing - 1 > 0) {
           var goalCell6 = Point (xCordOfAttackedKing, yCordOfAttackedKing, -1, -1);
            goalCellsOfKing.push(goalCell6);  
        }      
    }

    if (IsEmpty(Point (xCordOfAttackedKing, yCordOfAttackedKing, 0, -1))) {
        if (xCordOfAttackedKing - 1 > 0) {
            var goalCell7 = Point (xCordOfAttackedKing, yCordOfAttackedKing, 0, -1); 
            goalCellsOfKing.push(goalCell7);    
        }
    }

    if (IsEmpty(Point (xCordOfAttackedKing, yCordOfAttackedKing, 1, -1))) {
        if (xCordOfAttackedKing + 1 < 9 && yCordOfAttackedKing - 1 > 0) {
            var goalCell8 = Point (xCordOfAttackedKing, yCordOfAttackedKing, 1, -1); 
            goalCellsOfKing.push(goalCell8); 
        }                
    }

    for (var i = 1; i < 9; i++) {
        for (var j = 1; j < 9; j++) {
            if (!IsEmpty(Point(i,j,0,0))) {

                currentFigure = Point(i,j,0,0).children();
                currentFigureType = currentFigure.attr('type');
                currentFigureColor = currentFigure.attr('color');


                if ((currentFigureColor == color_a)) {
                    Navigate(parseInt(i),parseInt(j),currentFigureType,color_a); //прокладываем путь для каждой фигуры цвета агрессора
                    for (var m = 0; m < goalCellsOfKing.length; m++ ) {
                        if (goalCellsOfKing[m].hasClass('navigate')) {
                            goalCellsOfKing.splice(m,1); //удаляем вариант хода короля
                        }
                    }
                    RemoveClasses();
                }
            
                //если фигура относится к команде защитника
                if (currentFigureColor != color_a && currentFigureType != 'king') {
                    Navigate(parseInt(x_a),parseInt(y_a),type_a,color_a); //прокладываем путь фигуры -агрессора
                    pathLengthBeforeProtect = CheckPathLength(parseInt(xCordOfAttackedKing), parseInt(yCordOfAttackedKing), parseInt(x_a), parseInt(y_a)); //посчитали длину пути  до защиты
                    Navigate(parseInt(i),parseInt(j),currentFigureType,currentFigureColor); //прокладываем путь фигуры - защитника
                    pathLengthAfterProtect = CheckPathLength(parseInt(xCordOfAttackedKing), parseInt(yCordOfAttackedKing),parseInt(x_a), parseInt(y_a));

                    if (cell_a.hasClass('attack') || pathLengthBeforeProtect > pathLengthAfterProtect) {
                        figuresCanProtect.push(currentFigure.attr('id'));
                        //cellsCanAttackWhenShah.push(i.toString()+j);
                    }
                    RemoveClasses();
                }   
            }                    
        }
    } 

    if ((goalCellsOfKing.length == 0) && (figuresCanProtect.length == 0)) { //если ходов не под атакой не осталось и не кому защитить
        return true;
    }
    else {
        return false;
    }
}

function PawnToQueen(where, figure){
    var figureColor = $(figure).attr('color');
    var xCord = $(where).attr('x');
    var yCord = $(where).attr('y');

    if (figureColor == 'white' && xCord == 1) {
        $(figure).remove();
        InsertFigure(xCord,yCord, whiteQueen);
    } else if (figureColor == 'black' && xCord == 8) {
        $(figure).remove();
        InsertFigure(xCord,yCord, blackQueen);
    }

}
//отметить выбранную фиругу
function CheckRed (cell) {
    $(cell).addClass('checked');
    checked = true; //флаг выбранной фигуры

}
//снять отметку с фигуры
function UncheckRed (cell) {
    $(cell).removeClass('checked');
    $('.attack').removeClass('attack');
    checked = false; //снимаем флаг выбранной фигуры
}
//повторный клик по уже выбранной фигуре
function ClickChecked(cell) {
    UncheckRed(cell); //снимаем выделение с фигуры
    $('.navigate').toggleClass('navigate'); //удалем варианты ходов
    $('.attack').toggleClass('attack'); //удаляем варианты атаки
    $('.castling').toggleClass('castling'); //удаляем варианты рокировок
}

function EndTurn() {
    $('.navigate').toggleClass('navigate');
    $('.attack').toggleClass('attack');
    $('.castling').toggleClass('castling');
    canMove = false;
    figuresCanProtect.length = 0;
    cellsCanMoveWhenShah.length = 0;
    Shah = false;
}


function RemoveClasses(){
    $('.navigate').toggleClass('navigate');
    $('.attack').toggleClass('attack');
    $('.castling').toggleClass('castling');
}

//метод для выборки квадратов для подсвечивания атакой или навигацией

function Point(x,y,i1, i2) {
    return $('[x='+ (parseInt(x)+i1) + '][y='+(parseInt(y)+i2)+']');
}

//вынес логику проверки на шах ладьи и слона в отдельные функции, чтобы не повторять код в логике ферзя
function BitshopShahLogic(x,y,color){
    //goalCell 1-4 - это четыре разных направления возможного движения слона
    //не придумал, как можно реализовать одним циклом, поэтому 4

    //юго-восток
    for (var i = 1; i < 9; i++) {
        var goalCell1 = Point(x,y,i,i);
        if (!IsEmpty(goalCell1)) {
            if (ShahCheck(goalCell1, color)) {
                //alert('Shah!');
                return true;
            }
            break;
        }
    }

    //юго-запад
    for (var i = 1; i < 9; i++) {
        var goalCell2 = Point(x,y,i,-i);
        if (!IsEmpty(goalCell2)) {
            if (ShahCheck(goalCell2, color)) {
                return true;
            }
            break;
        }
    }

    //с-в
    for (var i = 1; i < 9; i++) {
        var goalCell3 = Point(x,y,-i,i)
        if (!IsEmpty(goalCell3)) {
            if (ShahCheck(goalCell3, color)) {
                return true;
            }
            break;
        }
    }

    //с-з
    for (var i = 1; i < 9; i++) {
        var goalCell4 = Point(x,y,-i,-i);
        if (!IsEmpty(goalCell4)) {
            if (ShahCheck(goalCell4, color)) {
                return true;
            }
            break;
        }
    }
}
function RookShahLogic (x,y,color) {
    //подсветка предлагаемых ячеек ниже фигуры
    for (var i = x; i < 9; i++) {
        var goalCell = Point(i,y,1,0);
        if (!IsEmpty(goalCell)) {
            if (ShahCheck(goalCell, color)) {
                //alert('Shah!');
                return true;
            }
            break;
        }

    }
    //выше фигуры
    for (var i = x; i > 0; i--) {
        var goalCell = Point(i,y,-1,0);
        if (!IsEmpty(goalCell)) {
            if (ShahCheck(goalCell, color)) {
                //alert('Shah!');
                return true;
            }
            break;
        }

    }
    //правее фигуры
    for (var j = y; j < 9; j++) {
        var goalCell = Point(x,j,0,1)
        if (!IsEmpty(goalCell)) {
            if (ShahCheck(goalCell, color)) {
                //alert('Shah!');
                return true;
            }
            break;
        }
    }
    //левее фигуры
    for (var j = y; j > 0; j--) {
        var goalCell = Point(x,j,0,-1);
        if (!IsEmpty(goalCell)) {
            if (ShahCheck(goalCell, color)) {
                //alert('Shah!');
                return true;
            }
            break;
        }
    }
}

//проверка на шах
function IsShah (x,y,type,color) {
    if (type == 'pawn') {
        if (color == 'white') {
            var attackCell1 = Point (x,y,-1,1);
            var attackCell2 = Point (x,y,-1,-1);

            var attackCell1Type = $(attackCell1).children().attr('type'); //тип первой атакуемой фигуры
            var attackCell2Type = $(attackCell2).children().attr('type'); //тип второй атакуемой фигуры

            var attackCell1Color = $(attackCell1).children().attr('color'); //цвет1
            var attackCell2Color = $(attackCell2).children().attr('color'); //цвет2


            if (attackCell1Type == 'king' && attackCell1Color != color || attackCell2Type == 'king' && attackCell2Color != color) {
                return true;
            }
            else {
                return false;
            }
        }
        if (color == 'black') {
            var attackCell1 = Point (x,y,1,1);
            var attackCell2 = Point (x,y,1,-1);

            var attackCell1Type = $(attackCell1).children().attr('type'); //тип первой атакуемой фигуры
            var attackCell2Type = $(attackCell2).children().attr('type'); //тип второй атакуемой фигуры

            var attackCell1Color = $(attackCell1).children().attr('color'); //цвет1
            var attackCell2Color = $(attackCell2).children().attr('color'); //цвет2


            if (attackCell1Type == 'king' && attackCell1Color != color
                || attackCell2Type == 'king' && attackCell2Color != color) {
                return true;
            }
        }
    }
    else if (type == 'knight') {
        //выше коня
        var attackCell1 = Point(x,y,-2,1);
        var attackCell2 = Point(x,y,-2,-1);
        var attackCell3 = Point(x,y,-1,-2);
        var attackCell4 = Point(x,y,-1,2);
        //ниже коня
        var attackCell5 = Point(x,y,1,2);
        var attackCell6 = Point(x,y,1,-2);
        var attackCell7 = Point(x,y,2,1);
        var attackCell8 = Point(x,y,2,-1);

        var attackCell1Type = $(attackCell1).children().attr('type'); //тип первой атакуемой фигуры
        var attackCell2Type = $(attackCell2).children().attr('type'); //тип второй атакуемой фигуры
        var attackCell3Type = $(attackCell3).children().attr('type');
        var attackCell4Type = $(attackCell4).children().attr('type');
        var attackCell5Type = $(attackCell5).children().attr('type');
        var attackCell6Type = $(attackCell6).children().attr('type');
        var attackCell7Type = $(attackCell7).children().attr('type');
        var attackCell8Type = $(attackCell8).children().attr('type');

        var attackCell1Color = $(attackCell1).children().attr('color'); //цвет1
        var attackCell2Color = $(attackCell2).children().attr('color'); //цвет2
        var attackCell3Color = $(attackCell3).children().attr('color'); //цвет3
        var attackCell4Color = $(attackCell4).children().attr('color'); //цвет4
        var attackCell5Color = $(attackCell5).children().attr('color'); //цвет5
        var attackCell6Color = $(attackCell6).children().attr('color'); //цвет6
        var attackCell7Color = $(attackCell7).children().attr('color'); //цвет7
        var attackCell8Color = $(attackCell8).children().attr('color'); //цвет8

        if (attackCell1Type == 'king' && attackCell1Color != color
        || attackCell2Type == 'king' && attackCell2Color != color
        || attackCell3Type == 'king' && attackCell3Color != color
        || attackCell4Type == 'king' && attackCell4Color != color
        || attackCell5Type == 'king' && attackCell5Color != color
        || attackCell6Type == 'king' && attackCell6Color != color
        || attackCell7Type == 'king' && attackCell7Color != color
        || attackCell8Type == 'king' && attackCell8Color != color) {
            return true;
        }



    }
    else if (type == 'rook') {
        if (RookShahLogic(x,y,color)) {
            return true;
        }

    }
    else if (type == 'bitshop') {
        if (BitshopShahLogic(x,y,color)) {
            return true;
        }
    }
    else if (type == 'queen') {
        if (RookShahLogic(x,y,color) || BitshopShahLogic(x,y,color)) {
            return true;
        }
    }
    return false;
}

function ShahCheck(cell,color) {
    var figure = $(cell).children();
    if (figure.attr('type') == 'king' && figure.attr('color') != color) {
        return true;
    }
    return false;
}

//вынес подсветку логики ладьи и слона,
//т.к. их логика используется еще и ферзем
function RookMoveLogic(x,y,color){
    
    if (!Shah) {
        //подсветка предлагаемых ячеек ниже фигуры
        for (var i = x; i < 9; i++) {
            var goalCell = Point(i,y,1,0);
            if (IsEmpty(goalCell)) {
                goalCell.toggleClass('navigate');
            } else {
                if ($(goalCell).children().attr('color') != color) {
                    goalCell.toggleClass('attack');
                }
                break;
            }

        }
        //выше фигуры
        for (var i = x; i > 0; i--) {
            var goalCell = Point(i,y,-1,0);
            if (IsEmpty(goalCell)) {
                goalCell.toggleClass('navigate');
            } else {
                if ($(goalCell).children().attr('color') != color) {
                    goalCell.toggleClass('attack');
                }
                break;
            }

        }
        //правее фигуры
        for (var j = y; j < 9; j++) {
            var goalCell = Point(x,j,0,1)
            if (IsEmpty(goalCell)) {
                goalCell.toggleClass('navigate');
            } else {
                if ($(goalCell).children().attr('color') != color) {
                    goalCell.toggleClass('attack');
                }
                break;
            }
        }
        //левее фигуры
        for (var j = y; j > 0; j--) {
            var goalCell = Point(x,j,0,-1);
            if (IsEmpty(goalCell)) {
                goalCell.toggleClass('navigate');
            } else {
                if ($(goalCell).children().attr('color') != color) {
                    goalCell.toggleClass('attack');
                }
                break;
            }
        }
    }
    else {
        //подсветка предлагаемых ячеек ниже фигуры
        for (var i = x; i < 9; i++) {
            var goalCell = Point(i,y,1,0);
            var gc_xy = (i+1).toString() + y;

            if (in_array(gc_xy, cellsCanMoveWhenShah)) {
                if (IsEmpty(goalCell)) {
                    goalCell.toggleClass('navigate');
                } else {
                    if ($(goalCell).children().attr('color') != color) {
                        goalCell.toggleClass('attack');
                    }
                    break;
                }
            }
            

        }
        //выше фигуры
        for (var i = x; i > 0; i--) {
            var goalCell = Point(i,y,-1,0);
            var gc_xy = (i-1).toString() + y;

            if (in_array(gc_xy, cellsCanMoveWhenShah)) {
                if (IsEmpty(goalCell)) {
                    goalCell.toggleClass('navigate');
                } else {
                    if ($(goalCell).children().attr('color') != color) {
                        goalCell.toggleClass('attack');
                    }
                    break;
                }
            }
        }
        //правее фигуры
        for (var j = y; j < 9; j++) {
            var goalCell = Point(x,j,0,1)
            var gc_xy = x.toString() + (j+1);

            if (in_array(gc_xy, cellsCanMoveWhenShah)) {
                if (IsEmpty(goalCell)) {
                    goalCell.toggleClass('navigate');
                } else {
                    if ($(goalCell).children().attr('color') != color) {
                        goalCell.toggleClass('attack');
                    }
                    break;
                }
            }
        }
        //левее фигуры
        for (var j = y; j > 0; j--) {
            var goalCell = Point(x,j,0,-1);
            var gc_xy = x.toString() + (j-1);

            if (in_array(gc_xy, cellsCanMoveWhenShah)) {
                if (IsEmpty(goalCell)) {
                    goalCell.toggleClass('navigate');
                } else {
                    if ($(goalCell).children().attr('color') != color) {
                        goalCell.toggleClass('attack');
                    }
                    break;
                }
            }
        }
    }  
}
function BitshopMoveLogic(x,y,color){
    
    if (!Shah) {
        //goalCell 1-4 - это четыре разных направления возможного движения слона
        //не придумал, как можно реализовать одним циклом, поэтому 4

        //юго-восток
        for (var i = 1; i < 9; i++) {
            var goalCell1 = Point(x,y,i,i);
            if (IsEmpty(goalCell1)) {
                goalCell1.toggleClass('navigate');
            } else  {
                if ($(goalCell1).children().attr('color') != color) {
                    goalCell1.toggleClass('attack');
                    //ShahCheck(goalCell1, color); //проверка на шах
                }
                break;
            }
        }

        //юго-запад
        for (var i = 1; i < 9; i++) {
            var goalCell2 = Point(x,y,i,-i);
            if (IsEmpty(goalCell2)) {
                goalCell2.toggleClass('navigate');
            } else {
                if ($(goalCell2).children().attr('color') != color) {
                    goalCell2.toggleClass('attack');
                    //ShahCheck(goalCell2, color); //проверка на шах
                }
                break;
            }
        }

        //с-в
        for (var i = 1; i < 9; i++) {
            var goalCell3 = Point(x,y,-i,i)
            if (IsEmpty(goalCell3)) {
                goalCell3.toggleClass('navigate');
            } else {
                if ($(goalCell3).children().attr('color') != color) {
                    goalCell3.toggleClass('attack');
                    //ShahCheck(goalCell3, color); //проверка на шах
                }
                break;
            }
        }

        //с-з
        for (var i = 1; i < 9; i++) {
            var goalCell4 = Point(x,y,-i,-i);
            if (IsEmpty(goalCell4)) {
                goalCell4.toggleClass('navigate');
            } else {
                if ($(goalCell4).children().attr('color') != color) {
                    goalCell4.toggleClass('attack');
                    //ShahCheck(goalCell4, color); //проверка на шах
                }
                break;
            }
        }
    } else {
        //goalCell 1-4 - это четыре разных направления возможного движения слона
        //не придумал, как можно реализовать одним циклом, поэтому 4

        //юго-восток
        for (var i = 1; i < 9; i++) {
            var goalCell = Point(x,y,i,i);
            var gc_xy = (x+i).toString() + (y + i);

            if (in_array(gc_xy, cellsCanMoveWhenShah)) {
                if (IsEmpty(goalCell)) {
                    goalCell.toggleClass('navigate');
                } else  {
                    if ($(goalCell).children().attr('color') != color) {
                        goalCell.toggleClass('attack');
                    }
                    break;
                }
            }
        }

        //юго-запад
        for (var i = 1; i < 9; i++) {
            var goalCell = Point(x,y,i,-i);
            var gc_xy = (x+i).toString() + (y-i);

            if (in_array(gc_xy, cellsCanMoveWhenShah)) {
                if (IsEmpty(goalCell)) {
                    goalCell.toggleClass('navigate');
                } else  {
                    if ($(goalCell).children().attr('color') != color) {
                        goalCell.toggleClass('attack');
                    }
                    break;
                }
            }
        }

        //с-в
        for (var i = 1; i < 9; i++) {
            var goalCell = Point(x,y,-i,i)
            var gc_xy = (x-i).toString() + (y+i);

            if (in_array(gc_xy, cellsCanMoveWhenShah)) {
                if (IsEmpty(goalCell)) {
                    goalCell.toggleClass('navigate');
                } else  {
                    if ($(goalCell).children().attr('color') != color) {
                        goalCell.toggleClass('attack');
                    }
                    break;
                }
            }
        }

        //с-з
        for (var i = 1; i < 9; i++) {
            var goalCell = Point(x,y,-i,-i)
            var gc_xy = (x-i).toString() + (y-i);

            if (in_array(gc_xy, cellsCanMoveWhenShah)) {
                if (IsEmpty(goalCell)) {
                    goalCell.toggleClass('navigate');
                } else  {
                    if ($(goalCell).children().attr('color') != color) {
                        goalCell.toggleClass('attack');
                    }
                    break;
                }
            }
        }
    }
}





//вставка фигуры в координаты
function InsertFigure (x,y,figure) {
    $('[x='+x+']'+'[y='+y+']').append(figure);
}
//переключение хода
function ToggleTurn (turn) {
    return !turn;
}

//проверка ячейки на наличие фигурки
function IsEmpty (cell) {
    if (($(cell).find('img').length == 0) || !$(cell).children().is(':visible')) return true;
    return false;
}

function KingMoveLogic (x,y,color) {
    var numberOfKingMoves = 0; //количество возможных ходов короля - мб для мата пригодится;

    //все возможные шаги вокруг короля
    var goalCell1 = Point(x,y,1,1);
    var goalCell2 = Point(x,y,1,0);
    var goalCell3 = Point(x,y,1,-1);
    var goalCell4 = Point(x,y,0,-1);
    var goalCell5 = Point(x,y,-1,-1);
    var goalCell6 = Point(x,y,-1,0);
    var goalCell7 = Point(x,y,-1,1);
    var goalCell8 = Point(x,y,0,1);


    if (((x == 1 || x == 8) && y == 5)) {

        //кол-во пустых ячеек правее королей (для короткой рокировки)
        var emptyCellsRight;
        var emptyCellsLeft;
        var tmpEmptyCells = 0;
        for (var i = 1; i < 3; i++) {
            //var tmpEmptyCells = 0;
            if (color == 'black'){
                var goalCell = Point (1,5,0,i);
                if (IsEmpty(goalCell)) {
                    tmpEmptyCells++;
                }
                else {
                    break;
                }
            }
            else if (color == 'white') {
                var goalCell = Point (8,5,0,i);
                if (IsEmpty(goalCell)) {
                    tmpEmptyCells++;
                }
                else {
                    break;
                }
            }
            emptyCellsRight = tmpEmptyCells;
        }
        tmpEmptyCells = 0;

        for (var i = 1; i < 4; i++) {
            if (color == 'black') {
                var goalCell = Point (1,5,0,-i);
                if (IsEmpty(goalCell)) {
                    tmpEmptyCells++;
                }
                else {
                    break;
                }
            }
            else if (color == 'white') {
                var goalCell = Point (8,5,0,-i);
                if (IsEmpty(goalCell)) {
                    tmpEmptyCells++;
                }
                else {
                    break;
                }
            }
            emptyCellsLeft = tmpEmptyCells;
        }

        if (emptyCellsRight == 2) {
            if ((color == 'white') && ((Point(8,5,0,3)).children().attr('type') == 'rook') && (Point(8,5,0,3)).children().attr('color') == color) { //на смещении стоит ладья нужного цвета
                var goalCell = Point (8,5,0,2);
                goalCell.addClass('castling');
            }
            else if ((color == 'black') && ((Point(1,5,0,3)).children().attr('type') == 'rook') && (Point(1,5,0,3)).children().attr('color') == color) {
                var goalCell = Point (1,5,0,2);
                goalCell.addClass('castling');
            }
        }

        if (emptyCellsLeft == 3)  {
            if ((color == 'white') && ((Point(8,5,0,-4)).children().attr('type') == 'rook') && (Point(8,5,0,-4)).children().attr('color') == color) {
                var goalCell = Point (8,5,0,-2);
                goalCell.addClass('castling');
            }
            else if ((color == 'black') && ((Point(1,5,0,-4)).children().attr('type') == 'rook') && (Point(1,5,0,-4)).children().attr('color') == color) {
                var goalCell = Point (1,5,0,-2);
                goalCell.addClass('castling');
            }
        }
    }

    //переменные для проверки возможности хода и атаки клетки
    var goalCell1_go = goalCell2_go = goalCell3_go = goalCell4_go =goalCell5_go = goalCell6_go = goalCell7_go = goalCell8_go = false;
    var goalCell1_attack = goalCell2_attack = goalCell3_attack = goalCell4_attack =goalCell5_attack = goalCell6_attack = goalCell7_attack = goalCell8_attack = false;



    if ((parseInt(x)+1 < 9) && (parseInt(y)+1 < 9)) {
        if (IsEmpty(goalCell1) && (!ShahCheckBeforeKingMove(parseInt(x)+1,parseInt(y)+1,color))) {
            //goalCell1.toggleClass('navigate');
            goalCell1_go = true;
        }
        else  {
            if ((!IsEmpty(goalCell1)) && ($(goalCell2).children().attr('color') != color)) {
                //goalCell1.toggleClass('attack');
                goalCell1_attack = true;
            }      
        }
    }
       

    if (parseInt(x)+1 < 9) {
        if ((IsEmpty(goalCell2)) && (!ShahCheckBeforeKingMove(parseInt(x)+1,parseInt(y),color))) {
            //goalCell2.toggleClass('navigate');
            goalCell2_go = true;
        }
        else  {
            if ((!IsEmpty(goalCell2)) && ($(goalCell2).children().attr('color') != color)) {
                //goalCell2.toggleClass('attack');
                goalCell2_attack = true;
            }
        }
    }

    if ((parseInt(x)+1 < 9) && (parseInt(y)-1 > 0)) {
        if ((IsEmpty(goalCell3)) && (!ShahCheckBeforeKingMove(parseInt(x)+1,parseInt(y)-1,color))) {
            //goalCell3.toggleClass('navigate');
            goalCell3_go = true;
        }
        else  {
            if ((!IsEmpty(goalCell3)) && ($(goalCell3).children().attr('color') != color)) {
                //goalCell3.toggleClass('attack');
                goalCell3_attack = true;

            }
        }
    }

    if (parseInt(y)-1 > 0) {
        if ((IsEmpty(goalCell4)) && (!ShahCheckBeforeKingMove(parseInt(x),parseInt(y)-1,color))) {
            //goalCell4.toggleClass('navigate');
            goalCell4_go = true;
        }
        else  {
            if ((!IsEmpty(goalCell4)) && ($(goalCell4).children().attr('color') != color)) {
                //goalCell4.toggleClass('attack');
                goalCell4_attack = true;
            }
        }
    }

    if ((parseInt(x)-1 > 0) && (parseInt(y)-1 > 0)) {
        if ((IsEmpty(goalCell5)) && (!ShahCheckBeforeKingMove(parseInt(x)-1,parseInt(y)-1,color))) {
            //goalCell5.toggleClass('navigate');
            goalCell5_go = true;
        }
        else  {
            if ((!IsEmpty(goalCell5)) && ($(goalCell5).children().attr('color') != color)) {
                //goalCell5.toggleClass('attack');
                goalCell5_attack = true;
            }
        }
    }

    if (parseInt(x)-1>0)  {
        if ((IsEmpty(goalCell6)) && (!ShahCheckBeforeKingMove(parseInt(x)-1,parseInt(y),color))) {
         //   goalCell6.toggleClass('navigate');
            goalCell6_go = true;
        }
        else  {
            if ((!IsEmpty(goalCell6)) && ($(goalCell6).children().attr('color') != color)) {
                //goalCell6.toggleClass('attack');
                goalCell6_attack = true;
            }
        }
    }

    if ((parseInt(x)-1 > 0) && (parseInt(y)+1 < 9 )) {
        if ((IsEmpty(goalCell7)) && (!ShahCheckBeforeKingMove(parseInt(x)-1,parseInt(y)+1,color))){
            //goalCell7.toggleClass('navigate');
            goalCell7_go = true;
        }
        else  {
            if ((!IsEmpty(goalCell7)) && ($(goalCell7).children().attr('color') != color)) {
                //goalCell7.toggleClass('attack');
                goalCell7_attack = true;
            }
        }
    }

    if (parseInt(y)+1 <9) {
        if ((IsEmpty(goalCell8)) && (!ShahCheckBeforeKingMove(parseInt(x),parseInt(y)+1,color))) {
            //goalCell8.toggleClass('navigate');
            goalCell8_go = true;
        }
        else  {
            if ((!IsEmpty(goalCell3)) && ($(goalCell3).children().attr('color') != color)) {
                //goalCell8.toggleClass('attack');
                goalCell8_attack = true;
            }
        }
    }

    //подсветка доступных для хода клеток
    if (goalCell1_go) {
        goalCell1.addClass('navigate');
    }
    if (goalCell2_go) {
        goalCell2.addClass('navigate');
    }
    if (goalCell3_go) {
        goalCell3.addClass('navigate');
    }
    if (goalCell4_go) {
        goalCell4.addClass('navigate');
    }
    if (goalCell5_go) {
        goalCell5.addClass('navigate');
    }
    if (goalCell6_go) {
        goalCell6.addClass('navigate');
    }
    if (goalCell7_go) {
        goalCell7.addClass('navigate');
    }
    if (goalCell8_go) {
        goalCell8.addClass('navigate');
    }

    //подсветка атаки ячеек

    if (goalCell1_attack) {
        goalCell1.addClass('attack');
    }   
    if (goalCell2_attack) {
        goalCell2.addClass('attack');
    }        
    if (goalCell3_attack) {
        goalCell3.addClass('attack');
    }        
    if (goalCell4_attack) {
        goalCell4.addClass('attack');
    }        
    if (goalCell5_attack) {
        goalCell5.addClass('attack');
    }       
    if (goalCell6_attack) {
        goalCell6.addClass('attack');
    }        
    if (goalCell7_attack) {
        goalCell7.addClass('attack');
    }        
    if (goalCell8_attack) {
        goalCell8.addClass('attack');
    }             
}

//отрисовка логики ходов для фигур
function Navigate (x,y,type,color) {
    
    if (!Shah) {
        //пешка

        if (type == 'pawn')  {
            if (color == 'white') {
                var goalCell = Point(x,y,1,0);
                var attackCell1 = Point(x,y,1,1); //правая под атакой белой
                var attackCell2 = Point(x,y,1,-1); //левая под атакой белой

                if (IsEmpty(goalCell)) {
                    goalCell.toggleClass('navigate');
                }

                if (x == 2) { //если это первый шаг этой пешки
                    var goalCell_1 = Point(x,y,+2,0);
                    if (IsEmpty(goalCell_1)) {
                        goalCell_1.toggleClass('navigate'); //подсвечиваем его
                    }
                }

                //если в ячейке по диагонали есть фигура и она противоположного цвета
                if (!IsEmpty(attackCell1) && $(attackCell1).children().attr('color') != color) {
                    attackCell1.toggleClass('attack')
                }
                if (!IsEmpty(attackCell2) && $(attackCell2).children().attr('color') != color) {
                    attackCell2.toggleClass('attack')
                }


            }
            else if (color == 'black') {
                var goalCell = Point(x,y,-1,0); //целевая ячейка черной пешки
                var attackCell1 = Point(x,y,-1,1); //правая под атакой черной
                var attackCell2 = Point(x,y,-1,-1);//левая под атакой черной

                if (IsEmpty(goalCell)) {
                    goalCell.toggleClass('navigate');
                }

                if (x == 7) { //если это первый шаг этой пешки
                    var goalCell_1 = Point(x,y,-2,0); //добавляем ей шаг на две клетки вперед
                    if (IsEmpty(goalCell_1)) {
                        goalCell_1.toggleClass('navigate'); //подсвечиваем его
                    }
                }
                //если в ячейке по диагонали есть фигура и она противоположного цвета
                if (!IsEmpty(attackCell1) && $(attackCell1).children().attr('color') != color) {
                    attackCell1.toggleClass('attack')
                }
                if (!IsEmpty(attackCell2) && $(attackCell2).children().attr('color') != color) {
                    attackCell2.toggleClass('attack')
                }
            }
        }
        //конь
        else if (type == 'knight') {
            //goalCell1-8 - возможные варианты хода коня

            //выше коня
            var goalCell1 = Point(x,y,-2,1);
            var goalCell2 = Point(x,y,-2,-1);
            var goalCell3 = Point(x,y,-1,-2);
            var goalCell4 = Point(x,y,-1,2);
            //ниже коня
            var goalCell5 = Point(x,y,1,2);
            var goalCell6 = Point(x,y,1,-2);
            var goalCell7 = Point(x,y,2,1);
            var goalCell8 = Point(x,y,2,-1);

            //проверка всех возможных для хода ячеек на присутствие или отсутствие вражеской фигуры
            if (IsEmpty(goalCell1)) {
                goalCell1.toggleClass('navigate');
            }
            else {
                //если фигура, которая там стоит - чужая, подсветить атакой
                if ($(goalCell1).children().attr('color') != color) {
                    goalCell1.toggleClass('attack');
                }
            }

            if (IsEmpty(goalCell2)) {
                goalCell2.toggleClass('navigate');

            }
            else {
                if ($(goalCell2).children().attr('color') != color) {
                    goalCell2.toggleClass('attack');
                }
            }

            if (IsEmpty(goalCell3)) {
                goalCell3.toggleClass('navigate');
            }
            else {
                if ($(goalCell3).children().attr('color') != color) {
                    goalCell3.toggleClass('attack');
                }
            }

            if (IsEmpty(goalCell4)) {
                goalCell4.toggleClass('navigate');
            }
            else {
                if ($(goalCell4).children().attr('color') != color) {
                    goalCell4.toggleClass('attack');
                }
            }

            if (IsEmpty(goalCell5)) {
                goalCell5.toggleClass('navigate');
            }
            else {
                if ($(goalCell5).children().attr('color') != color) {
                    goalCell5.toggleClass('attack');
                }
            }

            if (IsEmpty(goalCell6)) {
                goalCell6.toggleClass('navigate');
            }
            else {
                if ($(goalCell6).children().attr('color') != color) {
                    goalCell6.toggleClass('attack');
                }
            }

            if (IsEmpty(goalCell7)) {
                goalCell7.toggleClass('navigate');
            }
            else {
                if ($(goalCell7).children().attr('color') != color) {
                    goalCell7.toggleClass('attack');
                }
            }

            if (IsEmpty(goalCell8)) {
                goalCell8.toggleClass('navigate');
            }
            else {
                if ($(goalCell8).children().attr('color') != color) {
                    goalCell8.toggleClass('attack');
                }
            }

        }
        //ладья
        else if (type == 'rook') {
            RookMoveLogic(x,y,color);
        }
        //слон
        else if (type == 'bitshop') {
            BitshopMoveLogic(parseInt(x),parseInt(y),color);
        }
        //ферзь
        else if (type == 'queen') {

            //логика ферзя = логика ладьи+логика слона

            RookMoveLogic(parseInt(x),parseInt(y),color);
            BitshopMoveLogic(parseInt(x),parseInt(y),color);
        }
        //король
        else if (type == 'king') {
            KingMoveLogic (x,y,color);
        }

            
    }
    else if (Shah) {
        if (type == 'pawn')  {
            if (color == 'white') {
                var goalCell = Point(x,y,1,0);
                var attackCell1 = Point(x,y,1,1); //правая под атакой белой
                var attackCell2 = Point(x,y,1,-1); //левая под атакой белой

                var gc_xy = (x+1).toString()+y;
                var ac1_xy = (x+1).toString()+(y+1);
                var ac2_xy = (x+1).toString()+(y-1);

                if (IsEmpty(goalCell) && (in_array(gc_xy, cellsCanMoveWhenShah)))  {
                    goalCell.toggleClass('navigate');
                }

                if (x == 2) { //если это первый шаг этой пешки
                    var goalCell_1 = Point(x,y,2,0);
                    var gc2_xy = (x+2).toString()+y;

                    if (IsEmpty(goalCell_1) && in_array(gc2_xy, cellsCanMoveWhenShah)) {
                        goalCell_1.toggleClass('navigate'); //подсвечиваем его
                    }
                }

                //если в ячейке по диагонали есть фигура и она противоположного цвета
                if (in_array(ac1_xy, cellsCanMoveWhenShah) && !IsEmpty(attackCell1) && $(attackCell1).children().attr('color') != color) {
                    attackCell1.toggleClass('attack')
                }
                if (in_array(ac2_xy, cellsCanMoveWhenShah) && !IsEmpty(attackCell2) && $(attackCell2).children().attr('color') != color) {
                    attackCell2.toggleClass('attack')
                }


            }
            else if (color == 'black') {
                var goalCell = Point(x,y,-1,0); //целевая ячейка черной пешки
                var attackCell1 = Point(x,y,-1,1); //правая под атакой черной
                var attackCell2 = Point(x,y,-1,-1);//левая под атакой черной

                var gc_xy = (x-1).toString()+y;
                var ac1_xy = (x-1).toString()+(y+1);
                var ac2_xy = (x-1).toString()+(y-1);

                if (IsEmpty(goalCell) && (in_array(gc_xy, cellsCanMoveWhenShah)))  {
                    goalCell.toggleClass('navigate');
                }

                if (x == 2) { //если это первый шаг этой пешки
                    var goalCell_1 = Point(x,y,-2,0);
                    var gc2_xy = (x+2).toString()+y;

                    if (IsEmpty(goalCell_1) && in_array(gc2_xy, cellsCanMoveWhenShah)) {
                        goalCell_1.toggleClass('navigate'); //подсвечиваем его
                    }
                }

                //если в ячейке по диагонали есть фигура и она противоположного цвета
                if (in_array(ac1_xy, cellsCanMoveWhenShah) && !IsEmpty(attackCell1) && $(attackCell1).children().attr('color') != color) {
                    attackCell1.toggleClass('attack')
                }
                if (in_array(ac2_xy, cellsCanMoveWhenShah) && !IsEmpty(attackCell2) && $(attackCell2).children().attr('color') != color) {
                    attackCell2.toggleClass('attack')
                }
            }
        }
        else if (type == 'knight') {
            //goalCell1-8 - возможные варианты хода коня

            //выше коня
            var goalCell1 = Point(x,y,-2,1);
            var goalCell2 = Point(x,y,-2,-1);
            var goalCell3 = Point(x,y,-1,-2);
            var goalCell4 = Point(x,y,-1,2);
            //ниже коня
            var goalCell5 = Point(x,y,1,2);
            var goalCell6 = Point(x,y,1,-2);
            var goalCell7 = Point(x,y,2,1);
            var goalCell8 = Point(x,y,2,-1);

            var gc1_xy = (x-2).toString()+(y+1);
            var gc2_xy = (x-2).toString()+(y-1);
            var gc3_xy = (x-1).toString()+(y-2);
            var gc4_xy = (x-1).toString()+(y+2);

            var gc5_xy = (x+1).toString()+(y+2);
            var gc6_xy = (x+1).toString()+(y-2);
            var gc7_xy = (x+2).toString()+(y+1);
            var gc8_xy = (x+2).toString()+(y-1);

            //проверка всех возможных для хода ячеек на присутствие или отсутствие вражеской фигуры и способность хода защитить короля от шаха
            
            if (in_array(gc1_xy, cellsCanMoveWhenShah)) {
                if (IsEmpty(goalCell1)) {
                    goalCell1.toggleClass('navigate');
                }
                else {
                    //если фигура, которая там стоит - чужая, подсветить атакой
                    if ($(goalCell1).children().attr('color') != color) {
                        goalCell1.toggleClass('attack');
                    }
                } 
            }
            

            if (in_array(gc2_xy, cellsCanMoveWhenShah)) {
                if (IsEmpty(goalCell2)) {
                    goalCell2.toggleClass('navigate');
                }
                else {
                    //если фигура, которая там стоит - чужая, подсветить атакой
                    if ($(goalCell2).children().attr('color') != color) {
                        goalCell2.toggleClass('attack');
                    }
                } 
            }

            if (in_array(gc3_xy, cellsCanMoveWhenShah)) {
                if (IsEmpty(goalCell3)) {
                    goalCell3.toggleClass('navigate');
                }
                else {
                    //если фигура, которая там стоит - чужая, подсветить атакой
                    if ($(goalCell3).children().attr('color') != color) {
                        goalCell3.toggleClass('attack');
                    }
                } 
            }

            if (in_array(gc4_xy, cellsCanMoveWhenShah)) {
                if (IsEmpty(goalCell4)) {
                    goalCell4.toggleClass('navigate');
                }
                else {
                    //если фигура, которая там стоит - чужая, подсветить атакой
                    if ($(goalCell4).children().attr('color') != color) {
                        goalCell4.toggleClass('attack');
                    }
                } 
            }


            if (in_array(gc5_xy, cellsCanMoveWhenShah)) {
                if (IsEmpty(goalCell5)) {
                    goalCell5.toggleClass('navigate');
                }
                else {
                    //если фигура, которая там стоит - чужая, подсветить атакой
                    if ($(goalCell5).children().attr('color') != color) {
                        goalCell5.toggleClass('attack');
                    }
                } 
            }

            if (in_array(gc6_xy, cellsCanMoveWhenShah)) {
                if (IsEmpty(goalCell6)) {
                    goalCell6.toggleClass('navigate');
                }
                else {
                    //если фигура, которая там стоит - чужая, подсветить атакой
                    if ($(goalCell6).children().attr('color') != color) {
                        goalCell6.toggleClass('attack');
                    }
                } 
            }

            if (in_array(gc7_xy, cellsCanMoveWhenShah)) {
                if (IsEmpty(goalCell7)) {
                    goalCell7.toggleClass('navigate');
                }
                else {
                    //если фигура, которая там стоит - чужая, подсветить атакой
                    if ($(goalCell7).children().attr('color') != color) {
                        goalCell7.toggleClass('attack');
                    }
                } 
            }

            if (in_array(gc8_xy, cellsCanMoveWhenShah)) {
                if (IsEmpty(goalCell8)) {
                    goalCell8.toggleClass('navigate');
                }
                else {
                    //если фигура, которая там стоит - чужая, подсветить атакой
                    if ($(goalCell8).children().attr('color') != color) {
                        goalCell8.toggleClass('attack');
                    }
                } 
            }
        }
        else if (type == 'rook') {
            RookMoveLogic(parseInt(x),parseInt(y),color);
        }
        else if (type == 'bitshop') {
            BitshopMoveLogic(parseInt(x),parseInt(y),color);
        }
        else if (type == 'queen') {
            RookMoveLogic(parseInt(x),parseInt(y),color);
            BitshopMoveLogic(parseInt(x),parseInt(y),color);
        }
        else if (type == 'king') {
            KingMoveLogic(parseInt(x),parseInt(y),color);
        }

    }
}
    

//движение фигуры соперником
function MoveComp (figure, where) {

    var figureType = $(figure).attr('type');
    var figureColor = $(figure).attr('color');
    var xFigureCord = $(figure).parent().attr('x');
    var yFigureCord = $(figure).parent().attr('y');
    var xCord = $(where).attr('x');
    var yCord = $(where).attr('y');
    var goalFigure = $(where).children(); //атакуемая фигура

    if ($(where).hasClass('navigate')) {
        UncheckRed($(figure).parent()); //снимаем выделение
        
        InsertFigure (xCord, yCord,figure);

        if (figureType == 'pawn' && (xCord == 1 || xCord == 8)) {
            PawnToQueen(where, figure);
        }


        if (IsShah(xCord,yCord, $(figure).attr('type'), $(figure).attr('color'))) {
            if (MateCheck(figureColor, xCord, yCord)) { //в мат передаем цвет фигуры-АГРЕССОРА и ее координаты
                
                //socket.emit('finish');
                ClearBoard();
                /*
                if (confirm('Congratulations! You win. One more game?')) {
                    location.reload();
                } else {
                    window.close()
                }*/
                alert ('Shah and mate! You lose.');
                window.close();
                

                //location.reload();
            } else {
                alert ('Shah from '+ figureColor + ' ' + figureType);
                Shah = true;
            }
        }

        RemoveClasses();
        return true; //успех
    }
    else if ($(where).hasClass('attack')) {
        UncheckRed($(figure).parent()); //снимаем выделение
        goalFigure.remove(); //удаляем фигуру
        where.removeClass('attack'); //удаляем класс атаки
        where.addClass('navigate'); //добавляем navigate, чтобы можно было сюда шагнуть

        if (figureColor == 'white') { //если цвет был черный
            $('#boxForBlack').append(goalFigure); //в отделение для захваченных черных
        } else {
            $('#boxForWhite').append(goalFigure); //для белых
        }

        InsertFigure(xCord,yCord,figure);

        if (figureType == 'pawn' && (xCord == 1 || xCord == 8)) {
            PawnToQueen(where, figure);
        }

        if (IsShah(xCord,yCord, $(figure).attr('type'), $(figure).attr('color'))) {
            if (MateCheck(figureColor, xCord, yCord)) { //в мат передаем цвет фигуры-АГРЕССОРА и ее координаты
                
                ClearBoard();
                alert ('Shah and mate! You lose.');
                window.close();
            } else {
                alert ('Shah from '+ figureColor + ' ' + figureType);
                Shah = true;
            }
        }
        RemoveClasses();
        return true;
    }
    else {
        //alert ('Can\'t move here!');
        RemoveClasses();
        return false;
  }

}

//движение фигуры игроком
function Move (figure, where) {

    var figureType = $(figure).attr('type');
    var figureColor = $(figure).attr('color');
    var xFigureCord = $(figure).parent().attr('x');
    var yFigureCord = $(figure).parent().attr('y');
    var xCord = $(where).attr('x');
    var yCord = $(where).attr('y');

    if ($(where).hasClass('navigate')) {
        UncheckRed($(figure).parent()); //снимаем выделение
        
        InsertFigure(xCord, yCord,figure); //передвигаем картинку

        //-1 т.к. по Машиному протоколу координаты 0-7, а не 1-8
        socket.emit('step',xFigureCord-1,yFigureCord-1,xCord-1,yCord-1); //отправляем на сервер что и куда

        if (figureType == 'pawn' && (xCord == 1 || xCord == 8)) {
            PawnToQueen(where, figure);
        }
        if (IsShah(xCord,yCord, $(clFigure).attr('type'), $(clFigure).attr('color'))) {
            RemoveClasses();
            if (MateCheck(figureColor, xCord, yCord)) {
                alert ('Shah and mate!');
                socket.emit('finish');
                ClearBoard();
                if (confirm('Congratulations! You win. One more game?')) {
                    location.reload();
                } else {
                    window.close()
                }
            } else {
                alert ('Shah from '+ figureColor + ' '+figureType);
            }
        }
        return true; //успех
    }

    else if ($(where).hasClass('castling')) { //если рокировка
        if (figureColor == 'black') { //координата ладьи для ракировки в зависимости от цвета
            var xRookCord = 1;
        }
        else {
            var xRookCord = 8;
        }
        UncheckRed($(figure).parent()); //снимаем выделение
        
        $(where).append(figure);

        if (yCord == 7) { //короткая рокировка
            var tmpRook = Point(xRookCord,8,0,0).children() [0];
            InsertFigure(xRookCord,6,tmpRook);
            return true;
        }
        else if (yCord == 3) { //длинная рокировка
            var tmpRook = Point(xRookCord,1,0,0).children() [0];
            InsertFigure(xRookCord,4,tmpRook);
            return true;
            //figuresCanProtect.length = 0;
        }
    }
    else {
        //alert ('Can\'t move here!');
        return false;
  }

}
//атака фигуры
function Attack (attackedCell) {
    if ($(attackedCell).hasClass('attack')) { //если выбранная ячейка имеет класс атакуемой
        var attackedFigure = $(attackedCell).children(); //запоминаем атакованную фигуру
        var attackedFigureColor = attackedFigure.attr('color'); //запоминаем ее цвет

        if (attackedFigure.attr('type') == 'king') {
            ClearBoard();

            socket.emit('finish'); //отправляем конец игры
            if (confirm('Congratulations! You win. One more game?')) {
                    location.reload();
                } else {
                    window.close()
                }

        }
        //удаляем класс "атакуемая" и добавляем класс "навигация"
        //для того, чтобы можно было в неё перейти после удаления фигуры
        $(attackedCell).removeClass('attack').addClass('navigate');

        if (attackedFigureColor == 'black') { //если цвет был черный
            $('#boxForBlack').append(attackedFigure); //в отделение для захваченных черных
        } else {
            $('#boxForWhite').append(attackedFigure); //для белых
        }
    } else {
        alert('Can\'t attack!');
    }
}

$(document).ready(function () {
    

    socket.on('start',function(color) {

        ClearBoard();
        Dotting(); //пока нет второго игрока - фигур не будет
        Shah = false;

        figuresCanProtect = [];
        cellsCanMoveWhenShah = [];

        if (color == 'white') {
            whiteMove = true;
            canMove = true;
            console.log('White move!');
            $('#information').text('You play ' + color +'.');


        } else {
            whiteMove = false;
            canMove = false;
            console.log('Black move!');
            $('#information').text('You play ' + color +'.');
        }
    });

    socket.on('step', function(x,y,x1,y1) {
        
        //+1 т.к. протокол взаимодействия 0-7, а а клиенте 1-8
        x += 1;
        y += 1;
        x1 += 1;
        y1 += 1;
        console.log('Received coodrs x: %d, y: %d, x1: %d, y1: %d', x,y,x1,y1);
        var typeOfFigure = Point(x,y,0,0).children().attr('type'); //проверяем тип фигуры
        var colorOfFigure = Point(x,y,0,0).children().attr('color'); //проверяем цвет фигуры
        var figure = Point(x,y,0,0).children();
        var goalCell = Point(x1,y1,0,0);

        Navigate(parseInt(x),parseInt(y),typeOfFigure,colorOfFigure); //подсвечиваем допустимый маршрут (проверка на жульничество)

        if (MoveComp(figure, Point(x1,y1,0,0))) { //если можно сходить
            //InsertFigure(x1,y1,figure);
        } else {
            alert('Competitor try to cheat. You win!');
            socket.emit('cheatCatch');
        }
        canMove = true;        
    });
/*
    socket.on('finish', function(){
        ClearBoard();
        alert('You lose!');
        window.close();
    });
*/

    socket.on('disconnect', function() {
        alert('Competitor disconnected.');
        ClearBoard();
        location.reload();
    });

    CreateBoard (8,8); //создать доску 8х8
    var cell = '.darkCell,.lightCell'; //cell - это элементы с классами dC и lC

    $('#board').on('click', cell, function(){ //в случае клика по ячейке внутри board
        if (canMove) {
            if (!checked && !IsEmpty(this)) { //если нет выбранной фигуры и ячейка не пустая и шах не поставлен

                clFigure = $(this).children()[0]; //запоминаем фигуру
                var clFigureColor = $(clFigure).attr('color'); //цвет
                var clFigureType = $(clFigure).attr('type'); //тип
                var clFigureX = $(clFigure).parent().attr('x'); //x
                var clFigureY = $(clFigure).parent().attr('y'); //y
                var clFigureID = $(clFigure).attr('id');

                if (!Shah) { //если шах не поставлен

                    if (whiteMove && clFigureColor == 'white') {
                        CheckRed(this); //выделяем ячейку
                        //выделяем возможный вариант хода
                        Navigate(parseInt(clFigureX),parseInt(clFigureY),clFigureType,clFigureColor);
                    } 

                    else if (whiteMove && clFigureColor != 'white') { //если ход белых, а фигура черная
                        //$('#information').toggleClass('alertInformation');
                        //alert ('Error! It\'s white turn!');
                    }

                    else if (!whiteMove && clFigureColor == 'black') {
                        CheckRed(this); //выделяем ячейку
                        //возможный вариант ходов
                        Navigate(parseInt(clFigureX),parseInt(clFigureY),clFigureType,clFigureColor);
                        checked = true;
                    }

                    else if (!whiteMove && clFigureColor == 'white') { //если ход черных, а фигура белая
                        //('#information').toggleClass('alertInformation');
                        //alert ('Error! It\'s black turn!');
                    }
                }
                else {
                    if (whiteMove && clFigureColor == 'white' && ((in_array(clFigureID,figuresCanProtect)) || clFigureType == 'king')) {
                        CheckRed(this); //выделяем ячейку
                        //выделяем возможный вариант хода
                        Navigate(parseInt(clFigureX),parseInt(clFigureY),clFigureType,clFigureColor);
                        console.log('Выбрана белая фигура из массива защитников!');
                    } 

                    else if (whiteMove && clFigureColor != 'white') { //если ход белых, а фигура черная
                    }

                    else if (!whiteMove && clFigureColor == 'black' && ((in_array(clFigureID,figuresCanProtect)) || clFigureType == 'king')) {
                        CheckRed(this); //выделяем ячейку
                        //возможный вариант ходов
                        Navigate(parseInt(clFigureX),parseInt(clFigureY),clFigureType,clFigureColor);
                        console.log('Выбрана черная фигура из массива защитников!');
                    }

                    else if (!whiteMove && clFigureColor == 'white') { //если ход черных, а фигура белая
                    }
                }

                
            }

            else if (checked && $(this).hasClass('checked')) {//клик по уже выбранной фигуре
                ClickChecked(this); //отменить выделение
            }

            else if (checked && IsEmpty(this)) { //фигура выбрала, клик в пустую ячейку

                if (Move(clFigure, this)) { //если ход можно совершить
                    EndTurn();
                }

            }
            else if (checked && !IsEmpty(this)) {
                Attack(this);
                if (Move(clFigure,this)) {
                    EndTurn();
                }
            }
        }
    });

});

    