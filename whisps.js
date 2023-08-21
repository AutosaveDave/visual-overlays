const canvas = window.document.createElement("canvas");
canvas.id = "whisps-canvas";
canvas.style.position = "fixed";
canvas.style.top = 0;
canvas.style.left = 0;
canvas.style.mixBlendMode= 'multiply';
canvas.style.height = "100%";
canvas.style.width = "100%";
canvas.style.zIndex = 1;
canvas.style.pointerEvents = 'none';

const whispSurfaces = window.document.getElementsByClassName("whisps");
console.log(whispSurfaces[0].getRootNode());
whispSurfaces[0].appendChild(canvas);

const canvasEl = window.document.getElementById("whisps-canvas");

const getWhispDoc = () => {
    console.log(whispSurfaces[0].dataset.whisps)
    if( typeof whispSurfaces[0].dataset.whisps === 'string' ) {
        return whispSurfaces[0].dataset.whisps;
    }
    return "10x(whisp)"
}

const whispDoc = getWhispDoc();

const getWidth = () => canvasEl.clientWidth;
const getHeight = () => canvasEl.clientHeight;
const handleResize = () => { canvasEl.height = getHeight(); canvasEl.width = getWidth(); };

const ctx = canvasEl.getContext("2d");
const shadowAlpha = 1;
const timeObj = { 
    lastDrawn: ( new Date() ).getTime() / 1000 - ( 1000 / 60 ), 
    current: ( new Date() ).getTime() / 1000, 
    delta: 1000 / 60
};
const mouseObj = { x: getWidth() / 2, y: getHeight() / 2, mousedown: false, mouseup: false, speed: 0, direction: 0 };
const handleMouseMove = ( e ) => { 
    const time = ( new Date() ).getTime() / 1000;
    mouseObj.x = e.clientX; 
    mouseObj.y = e.clientY; 
    mouseObj.timeLastMoved = time;
    mouseObj.moved = true;
};
const handleMouseUp = ( e ) => { mouseObj.mouseup = true; };
const handleMouseDown = ( e ) => { mouseObj.mousedown = true; };

const spawnMargin = 24; // how far off-screen to spawn whisps
let nextWhispIdVar = 0;
const nextWhispId = () => nextWhispIdVar++;
let prevMouseCoords = [ mouseObj.x, mouseObj.y ];

const colorHues = { red:0, orange:30, yellow:60, green:100, sea:150, cyan:180, 
    sky:200, blue:240, indigo:260, purple:280, pink:300, fuschia:335, white:-1 };
const colorSets = {
    all: Object.keys( colorHues ), any: Object.keys( colorHues ),
    notWhite: Object.keys( colorHues ).slice( 0, Object.keys( colorHues ).length - 1 ),
    primary: [ colorHues.red, colorHues.blue, colorHues.yellow ],
    usa: [ colorHues.red, colorHues.white, colorHues.blue ],
    rgb: [ colorHues.red, colorHues.green, colorHues.blue ],
    eldritch: [ colorHues.fuschia, colorHues.purple, colorHues.indigo, colorHues.pink ],
    fire: [ colorHues.red, colorHues.orange, colorHues.yellow ],
    soulfire: [ colorHues.yellow, colorHues.green, colorHues.sea ],
    aquatic: [ colorHues.blue, colorHues.sky, colorHues.sea, colorHues.cyan ],
    seaweed: [ colorHues.blue, colorHues.sky, colorHues.sea, colorHues.cyan, colorHues.green, colorHues.indigo ],
    mystic: [ colorHues.white, colorHues.cyan, colorHues.sky, colorHues.yellow ],
    mythic: [ colorHues.yellow, colorHues.cyan, colorHues.fuschia ],
};
const rndColorShift = ( val, maxShift ) => {
    if( val === -1 ) return -1; // white stays white
    let v = ( val - maxShift + Math.floor( 2 * maxShift * Math.random() ) );
    if( v >= 360 ) v -= 360;
    if( v < 0 ) v += 360;
    return v;
}
const rndShift = ( val, maxShift ) => ( val - maxShift + Math.floor( (2 * maxShift * Math.random() ) * 100 ) / 100 );
const rndChoose = array => array[ Math.floor( ( array.length - 1 ) * Math.random() ) ];
const getColor = color => {
    if( typeof color === 'string' ){
        if( colorHues.hasOwnProperty( color ) )
            return rndColorShift( colorHues[ color ], 10 );
        if( colorSets.hasOwnProperty( color ) )
            return rndColorShift( rndChoose( colorSets[ color ] ), 10 );
    }
    if( typeof color === 'number' ) {
        return rndColorShift( color, 10 );
    }
    return -1;
}

const whispData = {
    propTypes: {
        'T' :   'type',
        'B' :   'behaviors',
        'L' :   'lightMap',
        'LS':   'lightScale',
        'LC':   'lightColor',
        'W' :   'whispImage',
        'WS':   'whispScale',
        'WC':   'whispColor',
        'M' :   'mods',
        'MOD':  'mods',
        '@' :   'spawnLoc',
        default: 'type',
    },
}

const degToRad = deg => 2 * Math.PI * deg / 360; 
const modVals = {       // increase from [0] (zero) to [10] (max)
    maxSpeed: [ 0, 100, 200, 300, 400, 500, 600, 700, 900, 1000 ],
    acceleration: [ 0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500 ],
    turnSpeed: [ 0, degToRad( 40 ), degToRad( 80 ), degToRad( 120 ), degToRad( 160 ), degToRad( 200 ), degToRad( 240 ), degToRad( 280 ), degToRad( 320 ), degToRad( 360 ), degToRad( 400 ) ],

}
const moveTypes = [ 'swim', 'drift', 'glide', 'crawl' ];    // movement types - not used yet

const mods = {
    whisp: {
        default: {
            main:{
                type: 'whisp', 
                lightColor: 'mystic',
                lightScale: { min: 2, max: 5 }, whispScale: { min: 1, max: 1 },
            },
            behaviors: [ {
                actions: [ { 
                    act: 'follow', target: 'cursor', 
                    maxSpeed: modVals.maxSpeed[5], 
                    acceleration: modVals.acceleration[5],
                    turnSpeed: modVals.turnSpeed[4]
                } ]
            } ],
        },
        fastest: { bmod: { actions: {maxSpeed: modVals.maxSpeed[9], acceleration: modVals.acceleration[10], } } },
        veryfast: { bmod: { actions: {maxSpeed: modVals.maxSpeed[9], acceleration: modVals.acceleration[9], } } },
        faster: { bmod: { actions: {maxSpeed: modVals.maxSpeed[8], acceleration: modVals.acceleration[8], } } },
        fast: { bmod: { actions: {maxSpeed: modVals.maxSpeed[7], acceleration: modVals.acceleration[7], } } },
        fastish: { bmod: { actions: {maxSpeed: modVals.maxSpeed[6], acceleration: modVals.acceleration[6], } } },
        slowish: { bmod: { actions: {maxSpeed: modVals.maxSpeed[4], acceleration: modVals.acceleration[4], } } },
        slow: { bmod: { actions: {maxSpeed: modVals.maxSpeed[3], acceleration: modVals.acceleration[3], } } },
        slower: { bmod: { actions: {maxSpeed: modVals.maxSpeed[2], acceleration: modVals.acceleration[2], } } },
        slowest: { bmod: { actions: {maxSpeed: modVals.maxSpeed[1], acceleration: modVals.acceleration[1], } } },
    },

    follow: {
        default: { main: {}, behaviors: [] }, // gets added to whisp regardless of arguments
    },
    
};

function getPropType( typeCode ) {
    const type = typeCode.toUpperCase();
    return ( whispData.propTypes.hasOwnProperty(type) 
            ? whispData.propTypes[type] 
            : whispData.propTypes.default );
}

function getSpawnLocValue( [ name, ...args ] ) {
    const sides = [...(name.split( '' ))];
    let _range = [];
    args.forEach( arg => { _range.push( parseInt( arg ) ); } );
    _range.sort( ( a, b ) => a - b );
    const _sides = ( ( sides.length > 0 ) ? sides : ['t','b','l','r'] );
    const _start = ( ( _range.length > 0 ) ? _range[0] : 0 );
    const _end = ( ( _range.length > 1 ) ? _range[1] : 100 );
    const _result = { sides: [ ..._sides ], range: { start: _start, end: _end } }
    return _result;
}

function getBehaviorValue( args, _i ) {
    let actions = [];
    let conditions = [];
    args.forEach( segment => {
        const values = segment.split( '.' );
        const [ prefix, ...vals ] = values;
        if( prefix === 'if' || prefix === 'on' || prefix === 'when' || prefix === 'while' ) {
            conditions.push( ( new Condition( vals, _i ) ) );
        } else {
            actions.push( ( new Action( values, _i ) ) );
        }
    } );
    const behavior = { actions: actions, conditions: conditions };
    return behavior;
}

function getScaleValue( args ) {
    args.sort( ( a, b ) => a - b );
    if( args.length > 1  && !( args[0] === args[1] ) ) {
        return { min: args[0], max: args[1], 
            current : Math.floor( 100 * ( args[0] + ( args[1] - args[0] ) * Math.random() ) ) / 100
        };
    } 
    if( args.length === 1 || args[0] === args[1] ) {
        return { min: args[0], max: args[0], current : args[0] };
    }
    return { min: 3, max: 3, current: 3 };
}
function getSideLength( whichSide ) {
    if( whichSide.side === 't' || whichSide.side === 'b' ) { 
        return whichSide.highX - whichSide.lowX; 
    }
    else if( whichSide.side === 'l' || whichSide.side === 'r' ) { 
        return whichSide.highY - whichSide.lowY; 
    }
    return 0;
}
function newSpawnCoords ( [...spawnLocArray] ) { 
    const spawnLoc = ( ( spawnLocArray.length > 0 ) ? spawnLocArray 
                : [ { sides: ['t','b','l','r'], range: { start: 0, end: 100 } } ] );
    const sideSpawn = { 
        t: { lowX: 0, highX: getWidth(), lowY: -spawnMargin, highY: -spawnMargin }, 
        b: { lowX: 0, highX: getWidth(), lowY: getHeight() + spawnMargin, highY: getHeight() + spawnMargin },
        l: { lowX: -spawnMargin, highX: -spawnMargin, lowY: 0, highY: getHeight() }, 
        r: { lowX: getWidth() + spawnMargin, highX: getWidth() + spawnMargin, lowY: 0, highY: getHeight() }, 
    };
    
    spawnLoc.forEach( loc => {
        (loc.sides).forEach( side => {
            if( side === 'b' || side === 't' ) {
                sideSpawn[ side ] = { 
                    lowX: Math.floor( getWidth() * loc.range.start / 100 ),
                    highX: Math.floor( getWidth() * loc.range.end / 100 )
                };
            } else if( side === 'r' || side === 'l' ) {
                sideSpawn[ side ] = { 
                    lowY: Math.floor( getHeight() * loc.range.start / 100 ),
                    highY: Math.floor( getHeight() * loc.range.end / 100 )
                };
            }
        } );
    } );
    const sideSpawnArray = [ { ...(sideSpawn.t), side: 't' }, 
                            { ...(sideSpawn.b), side: 'b' }, 
                            { ...(sideSpawn.l), side: 'l' }, 
                            { ...(sideSpawn.r), side: 'r' } ];
    let totalWeight = 0;
    sideSpawnArray.forEach( s => { totalWeight += getSideLength( s ); } );
    const rand = Math.floor( totalWeight * Math.random() );
    let result = { x: 0, y: 0 };
    let min = 0;
    sideSpawnArray.forEach( s => { 
        const w = getSideLength( s );
        if( rand >= min && rand < min + w ) {
            if( s.side === 't' || s.side === 'b' ) { 
                    result.x = rand - min + s.lowX;
                    result.y = ( ( s.side === 't' ) ? -spawnMargin : getHeight() + spawnMargin ); 
            }
            else if( s.side === 'l' || s.side === 'r' ) { 
                result.x = ( ( s.side === 'l' ) ? -spawnMargin : getWidth() + spawnMargin ); 
                result.y = rand - min + s.lowY; 
            }
        }
        min += w;
    } );
    return result;
}

const pointDistance = ( x1, y1, x2, y2 ) => Math.sqrt( Math.pow( x1 - x2, 2 ) + Math.pow( y1 - y2, 2 ) );
const pointDirection = ( x1, y1, x2, y2 ) => ( Math.atan2( y2 - y1, x1 - x2) + 2 * Math.PI ) % ( 2 * Math.PI );
const pointVector = ( x1, y1, x2, y2 ) => [ pointDistance( x1, y1, x2, y2 ), pointDirection( x1, y1, x2, y2 ) ];
const turnAmount = ( _dir1, _dir2 ) => {
    const array = [ _dir1 - _dir2, _dir1 + 2 * Math.PI - _dir2, _dir1 - 2 * Math.PI - _dir2 ];
    let best = 2 * Math.PI;
    array.forEach( dDir => { if( Math.abs( dDir ) < Math.abs( best ) ) best = dDir; } );
    return best;
}

const fixArgs = ( [ ...args ] ) => {
    const newArgs = [];
    args.forEach( arg => {
        const argInt = parseInt( arg );
        if( !( isNaN( argInt ) ) ) {
            newArgs.push( argInt );
        } else {
            newArgs.push( arg );
        }
    } );
    return newArgs;
}

const getConditionArgsObj = ( [ subject, type, ...args ], i ) => {
    const newArgs = fixArgs( args );
    const result = { subject: subject, type: type, whispIndex: i }
    if(newArgs.length > 0 ){
        switch( type ) {
            default:
            case 'outside': case 'out':
            case 'within': case 'in':
            case 'speed': case 'direction':
                Object.assign( result, ( 
                    ( newArgs.length > 1 ) 
                    ?  { min: newArgs[0], max: newArgs[1] }
                    :  { min: 0, max: newArgs[0] }
                ) );
                break;
        }
    }
    if( type === 'direction' ) {
        result.min = result.min * 2 * Math.PI / 360;
        result.min = result.min * 2 * Math.PI / 360;
    }
    return result;
}
const distShift = { min: 0.08, max: 0.08 };
const rndConditionShifts = {
    within: distShift, in: distShift, outside: distShift, out: distShift
};
const getCondShiftMultiplierObj = type => ( rndConditionShifts.hasOwnProperty( type ) ? rndConditionShifts[ type ] : {} );
const getCondShiftMultiplier = type => ( Object.entries( getCondShiftMultiplierObj( type ) ) );

class Condition {
    constructor( _args, _i ) {
        this.whispIndex = _i; 
        if( Array.isArray( _args ) ){
            Object.assign( this, getConditionArgsObj( _args, _i ) );
        } else if( typeof _args === 'object' ) {
            Object.assign( this, _args );
        }
        getCondShiftMultiplier( this.type ).forEach( ( [ key, val ] ) => {
            if( this.hasOwnProperty( key ) ) {
                Object.assign( this, rndShift( this[ key ], this[ key ] * val ) );
            }
        } );
    }
    evaluate() {
        let reverseLogic = false;
        let [ distance, x1, y1, subjectSpeed, subjectDirection ] = [0,0,0,0,0,0,0];
        switch( this.subject ) {
            case 'nearest': case 'cursor': 
                switch( this.type ) {
                    case 'out':
                    case 'outside': reverseLogic = true;
                    case 'within':
                    case 'in':
                        [ x1, y1 ] = whispList[this.whispIndex].getTargetCoords( this.subject );
                        distance = pointDistance( x1, y1, whispList[this.whispIndex].coords.x, whispList[this.whispIndex].coords.y );
                        return ( !reverseLogic ? ( distance <= this.max && distance >= this.min ) 
                                : !( distance <= this.max && distance >= this.min ) );
                    case 'speed':
                        subjectSpeed = ( whispList[this.whispIndex].getTargetVector( this.subject ) )[0];
                        return ( subjectSpeed <= this.max && subjectSpeed >= this.min );
                    case 'direction':
                        subjectDirection = ( whispList[this.whispIndex].getTargetVector( this.subject ) )[1];
                        return ( subjectDirection <= this.max && subjectDirection >= this.min );
                    default: return true;
                }
            case 'area': // Not yet functional
                switch( this.type ) {
                    case 'out':
                    case 'outside': reverseLogic = true;
                    case 'within':
                    case 'in': return true;
                    default: return true;
                }
            default: return true; 
        }
    }
}

const actionArgNames = { 
    follow: [ 'target', 'maxSpeed', 'acceleration', 'turnSpeed' ],
    flee:   [ 'target', 'maxSpeed', 'acceleration', 'turnSpeed' ],
};

const getActionArgsObj = ( [ act, ...args ], i ) => {
    const result = { act: act, whispIndex: i }
    const newArgs = fixArgs( args );
    if( act === 'follow' || act === 'flee' )
        newArgs[3] = 2 * Math.PI * newArgs[3] / 360;
    if(newArgs.length > 0 ) {
        newArgs.forEach( ( arg, _i ) => {
            result[ actionArgNames[ act ][ _i ] ] = arg;
        } );
    }
    return result;
}

const rndActionShifts = { maxSpeed: 30, turnSpeed: degToRad( 15 ), acceleration: 20 };

class Action {
    constructor( _args, _i ) { 
        if( Array.isArray( _args ) ) { 
            Object.assign( this, getActionArgsObj( _args, _i ) );
        } else if( typeof _args === 'object' ) {
            Object.assign( this, _args );
        }
        Object.keys( this ).forEach( k => {
            if( this.hasOwnProperty( k )  && !( typeof this[ k ] === 'string' ) )
            this[ k ] = rndShift( this[ k ], rndActionShifts[ k ] )
        } );
        Object.assign( this, { whispIndex: _i } );
    }
    perform() {  
        const args = [];
        actionArgNames[ this.act ].forEach( argName => { args.push( this[ argName ] ) } );
        switch( this.act ) {
            case 'follow': whispList[this.whispIndex].follow( args ); break;
            case 'drift': break;
            case 'turn': break;
            case 'orbit': break;
            case 'flee': whispList[this.whispIndex].flee( args ); break;
            default: break;
        }
    }
}

function getModObject( args, whispIndex ) {
    const modsObj = { main: { }, behaviors: [] };
    let behav = { actions: [], conditions: [] };
    if( Array.isArray( args ) && ( mods.hasOwnProperty( args[0] ) ) ) {
        args.forEach( arg => {
            if( typeof arg === 'string' ) {
                const [ type, segs ] = arg.split( '.' );
                if( mods.hasOwnProperty( type ) ) {
                    Object.assign( ( modsObj.main ), mods[ type ].default.main );
                    behav = { actions: [], conditions: [] };
                    if( mods[ type ].default.hasOwnProperty( 'behaviors' ) && Array.isArray( mods[ type ].default.behaviors ) ) {
                        mods[ type ].default.behaviors.forEach ( _b => {
                            const newC = []; const newA = [];
                            if( _b.hasOwnProperty( 'conditions' ) && Array.isArray( _b.conditions ) )
                                _b.conditions.forEach( _c => { newC.push( ( new Condition( _c, whispIndex ) ) ); } );
                            if( _b.hasOwnProperty( 'actions' ) && Array.isArray( _b.actions ) )
                                _b.actions.forEach( _a => { newA.push( ( new Action( _a, whispIndex ) ) ); } );
                                modsObj.behaviors.push( { actions: newA, conditions: newC } );
                        } ); 
                    }
                    if( Array.isArray( segs ) && segs.length > 0 ) {
                        segs.forEach( seg => {
                            const s = seg.toLowerCase();
                            if( mods[ type ].hasOwnProperty( s ) ) {
                                Object.assign( modsObj.main, ( mods[ type ][ s ].main ) );
                                if( mods[ type ][s].hasOwnProperty( 'behavior' ) ) {
                                    if( mods[ type ][s].behavior.hasOwnProperty( 'actions' ) ) {
                                        mods[ type ][s].behavior.actions.forEach( _a => {
                                            behav.actions.push( ( new Action( _a, whispIndex ) ) );
                                        } );
                                    }
                                    if( mods[ type ][s].behavior.hasOwnProperty( 'conditions' ) ) {
                                        mods[ type ][s].behavior.conditions.forEach( _c => {
                                            behav.conditions.push( ( new Condition( _c, whispIndex ) ) );
                                        } );
                                    }
                                } else if( mods[ type ][s].hasOwnProperty( 'bmod' ) && modsObj.behaviors.length > 0 ) {
                                    const acts = mods[ type ][s].bmod.hasOwnProperty( 'actions' );
                                    const conds = mods[ type ][s].bmod.hasOwnProperty( 'conditions' );
                                    modsObj.behaviors.forEach( ( b, bIndex ) => {
                                        if( acts && b.actions.length > 0 ) {
                                            b.actions.forEach( ( act, aIndex ) => {
                                                Object.assign( 
                                                    modsObj.behaviors[ bIndex ].actions[ aIndex ],
                                                    mods[ type ][s].bmod.actions 
                                                );
                                            } );
                                        }
                                        if( conds && b.conditions.length > 0 ) {
                                            b.conditions.forEach( ( cond, cIndex ) => {
                                                Object.assign( 
                                                    modsObj.behaviors[ bIndex ].conditions[ cIndex ], 
                                                    mods[ type ][s].bmod.conditions 
                                                );
                                            } );
                                        }
                                    } ); 
                                }
                                if( mods[ type ][s].behavior.hasOwnProperty( 'actions' ) )
                                    behav.actions.push( mods[ type ][ s ].behavior.actions );
                                if( mods[ type ][s].behavior.hasOwnProperty( 'conditions' ) )
                                    behav.actions.push( mods[ type ][ s ].behavior.conditions );
                            } else if( mods.hasOwnProperty( s ) && mods[ s ].hasOwnProperty( 'bmod' ) && modsObj.behaviors.length > 0 ) {
                                const acts = mods[ s ].bmod.hasOwnProperty( 'actions' );
                                const conds = mods[ s ].bmod.hasOwnProperty( 'conditions' );
                                modsObj.behaviors.forEach( ( b, bIndex ) => {
                                    if( acts && b.actions.length > 0 ) {
                                        b.actions.forEach( ( act, aIndex ) => {
                                            Object.assign( 
                                                modsObj.behaviors[ bIndex ].actions[ aIndex ],
                                                mods[ s ].bmod.actions 
                                            );
                                        } );
                                    }
                                    if( conds && b.conditions.length > 0 ) {
                                        b.conditions.forEach( ( cond, cIndex ) => {
                                            Object.assign( 
                                                modsObj.behaviors[ bIndex ].conditions[ cIndex ], 
                                                mods[ s ].bmod.conditions 
                                            );
                                        } );
                                    }
                                } );
                            }
                        } );
                    }
                    if( behav.hasOwnProperty( 'actions' ) && Array.isArray( behav.actions ) && behav.actions.length > 0 )
                        modsObj.behaviors.push( behav );
                }
            }
        } );
    }
    if( modsObj.main.hasOwnProperty( 'lightColor' ) && typeof modsObj.main.lightColor === 'string' ) {
        modsObj.main.lightColor = getColor( modsObj.main.lightColor )
    }
    //if( modsObj.main.hasOwnProperty(  ) )
    if( modsObj.main.hasOwnProperty( 'lightScale' ) ) 
        modsObj.main.lightScale.current = ( getScaleValue( [ modsObj.main.lightScale.min, modsObj.main.lightScale.max ] ) ).current;
    if( modsObj.main.hasOwnProperty( 'whispScale' ) ) 
        modsObj.main.whispScale.current = ( getScaleValue( [ modsObj.main.lightScale.min, modsObj.main.lightScale.max ] ) ).current;
    return modsObj;
}

class Whisp {
    constructor( whispString, i ) {
        const data = whispString.split( ' ', 20 );
        this.behaviors = [];
        const spawnData = [];
        data.forEach( phrase => { 
            const [ phraseType, phraseName, ...args ] = phrase.split( '-', 20 );
            const propType = getPropType( phraseType );
            switch( phraseType.toUpperCase() ) {          
                case 'B': // BEHAVIOR - add to behavior ( actions[] & conditions[] ) to behaviors[]
                    this.behaviors.push( getBehaviorValue( [ phraseName, ...args ], i ) ); 
                    break;
                case 'WS': case 'LS': // WHISP SIZE or LIGHT SIZE - set size (x32px) of whisp or light
                    this[ propType ] = getScaleValue( fixArgs( [ phraseName, ...args ] ) );
                    break;
                case 'WC': case 'LC': // WHISP COLOR or LIGHT COLOR - set color from colorHues/colorSets
                    this[ propType ] = getColor( phraseName.toLowerCase() );
                    break;
                case '@': // SPAWN LOCATION - set which sides/ coordinate ranges where whisp can spawn
                    spawnData.push( getSpawnLocValue( [ phraseName, ...args ] ) ); 
                    break;
                case '&': case 'T':
                case 'M' : case 'MOD': case 'MODS': // MODS - simpler way to change whisp settings
                    const modObject = getModObject( [ phraseName, ...args ], i );
                    Object.assign( this, modObject.main );
                    if( modObject.hasOwnProperty( 'behaviors' ) && Array.isArray( modObject.behaviors ) ) {
                        modObject.behaviors.forEach( _b => {
                            this.behaviors.push( _b );
                        } );
                    }
                    break;
                default:
                    const modObject2 = getModObject( [ phraseType, phraseName, ...args ], i );
                    Object.assign( this, modObject2.main );
                    if( modObject2.hasOwnProperty( 'behaviors' ) && Array.isArray( modObject2.behaviors ) ) {
                        modObject2.behaviors.forEach( _b => {
                            this.behaviors.push( _b );
                        } );
                    }
                    break;
            }
        } );
        this.spawnLoc = spawnData;
        const c = newSpawnCoords( spawnData );
        this.coords = { x: c.x, y: c.y };
        this.xspeed = 0;
        this.yspeed = 0;
        this.id = nextWhispId();
    }
    
    // ------ CALCULATION METHODS -------------------------------------------
    getNearestWhispIndex() {
        let nearest = 9999999;
        let nearestIndex = -1;
        whispList.forEach( ( _whisp, _i ) => {
            if( !( _whisp.id === this.id ) ) {
                const dist = pointDistance( this.coords.x, this.coords.y, _whisp.coords.x, _whisp.coords.y );
                if( nearest > dist ) {
                    nearest = dist;
                    nearestIndex = _i;
                }
            }
        } );
        return nearestIndex;
    }
    getNearestWhisp() { return whispList[ this.getNearestWhispIndex() ]; }
    getNearestWhispCoords() { 
        const _target = this.getNearestWhisp();
        return [ _target.coords.x, _target.coords.y ];
    }
    getNearestWhispVector() {
        const _target = this.getNearestWhisp();
        return [ _target.getSpeed(), _target.getDirection() ];
    }
    getNearestWhispSpeed() { return ( this.getNearestWhispVector() )[0]; }
    getNearestWhispDirection() { return ( this.getNearestWhispVector() )[1]; }
    getTargetCoords( target ) {
        switch( target ) {
            default:
            case 'cursor': return [ mouseObj.x, mouseObj.y ];
            case 'nearest': return this.getNearestWhispCoords();
        }
    }
    getTargetVector( target ) {
        switch( target ) {
            default:
            case 'cursor': return [ mouseObj.speed, mouseObj.direction ];
            case 'nearest': return this.getNearestWhispVector();
        }
    }
    getDirection() { return pointDirection( 0, 0, -this.xspeed, -this.yspeed ); }
    getSpeed() { return pointDistance( 0, 0, this.xspeed, this.yspeed ); }
    getVector() { 
        return [
            this.getSpeed(),
            this.getDirection()
        ]; 
    }
    getSpeedXY( [ _speed, _dir ] ) {
        return [ _speed * Math.cos( _dir ), -_speed * Math.sin( _dir ) ];
    }

    // ------ MOVEMENT METHODS -----------------------------------------------
    moveStep() {
        this.coords.x += this.xspeed * timeObj.delta;
        this.coords.y += this.yspeed * timeObj.delta;
    }
    turn( turnAngle ) {
        const adjustedAngle = turnAngle * timeObj.delta;
        const [ _speed, _dir ] = this.getVector();
        [ this.xspeed, this.yspeed ] = this.getSpeedXY( [ _speed, _dir + adjustedAngle ] )
    }
    turnTowardDirection( targetDirection, turnAngle ) {
        const maxAngle = turnAmount( this.getDirection(), targetDirection );
        this.turn(( Math.abs( turnAngle * timeObj.delta ) > Math.abs( maxAngle ) 
                ? maxAngle / timeObj.delta : Math.sign( maxAngle ) * turnAngle ) );
    }
    turnTowardPoint( _x, _y, turnAngle ) {
        const maxAngle = turnAmount( this.getDirection(), pointDirection( this.coords.x, this.coords.y, _x, _y ) );
        this.turn( ( Math.abs( turnAngle * timeObj.delta ) > Math.abs( maxAngle ) 
                ? maxAngle / timeObj.delta : Math.sign( maxAngle ) * turnAngle ) );
    }
    turnAwayFromPoint( _x, _y, turnAngle ) {
        const maxAngle = turnAmount( this.getDirection(), pointDirection( _x, _y, this.coords.x, this.coords.y ) );
        this.turn( ( Math.abs( turnAngle * timeObj.delta ) > Math.abs( maxAngle ) 
                ? maxAngle / timeObj.delta : Math.sign( maxAngle ) * turnAngle ) );
    }
    slowDown( _amount, _minSpeed ) {
        const [ _speed, _dir ] = this.getVector();
        const dSpeed = ( _speed - _amount * timeObj.delta >= _minSpeed 
                ? _amount * timeObj.delta : _speed - _minSpeed );
        [ this.xspeed, this.yspeed ] = this.getSpeedXY( [ _speed - dSpeed, _dir ] );
    }
    speedUp( _amount, _maxSpeed ) {
        const [ _speed, _dir ] = this.getVector();
        const dSpeed = ( _speed + _amount * timeObj.delta <= _maxSpeed 
                ? _amount * timeObj.delta : _maxSpeed - _speed );
        [ this.xspeed, this.yspeed ] = this.getSpeedXY( [ _speed + dSpeed, _dir ] );
    }

    // ------ BEHAVIOR METHODS -------------------------------------------------
    follow( [ target, maxSpeed, acceleration, turnSpeed ] ) {
        const [ _x, _y ] = this.getTargetCoords( target );
        this.turnTowardPoint( _x, _y, turnSpeed );
        this.speedUp( acceleration, maxSpeed );
    }
    flee( [ target, maxSpeed, acceleration, turnSpeed ] ) {
        const [ _x, _y ] = this.getTargetCoords( target );
        this.turnAwayFromPoint( _x, _y, turnSpeed );
        this.speedUp( acceleration, maxSpeed );
    }

    // ------ MAIN METHODS ----------------------------------------------------
    executeBehaviors() {
        this.behaviors.forEach( beh => {
            let conditionsMet = true;
            if( beh.hasOwnProperty( 'conditions' ) && Array.isArray( beh.conditions ) )
                beh.conditions.forEach( _cond => { if( conditionsMet ) conditionsMet = _cond.evaluate(); } );
            if( conditionsMet ) {
                beh.actions.forEach( _action => { _action.perform() } );
            }
        } );
    }
    getLightGradient() {
        const gradient = ctx.createRadialGradient( this.coords.x, this.coords.y, 0, this.coords.x, this.coords.y, 32 * this.lightScale.current );
        const startColor = (  ( this.lightColor >= 0 )
                            ? `hsla(${ this.lightColor },100%,50%,1)`
                            : `hsla(0,100%,100%,1)` );
        const endColor = ( ( this.lightColor >= 0 )
                            ? `hsla(${ this.lightColor },100%,50%,0)`
                            : `hsla(0,100%,100%,0)` );
        gradient.addColorStop( 0, startColor );
        gradient.addColorStop( 0.1, startColor );
        gradient.addColorStop( 1, endColor );
        return gradient;
    };
    drawLight() {
        ctx.globalCompositeOperation = 'screen';
        ctx.beginPath();
        ctx.fillStyle = this.getLightGradient();
        ctx.ellipse( this.coords.x, this.coords.y, 32 * this.lightScale.current, 32 * this.lightScale.current, 0, 0, 2 * Math.PI );
        ctx.fill();
    }
    step() {
        this.executeBehaviors();
        this.moveStep();
        this.drawLight();
    }
}

function readWhispDoc( wDoc ) {
    let doc = wDoc;
    const countChars = [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9' ];
    const multiplierChars = [ 'x', '*', 'X' ];
    const list = [];
    let [ delStart, delEnd ] = [ 0, 0 ];
    let [ wStart, wEnd ] = [ 0, 0 ];
    let _char = 1;
    let count = 0;
    let countString = '';
    let wString = '';
    for( let a = 0 ; a < doc.length ; a += 1 ) {
        if( doc.charAt( a ) === '(' ) {
            count = 0;
            _char = 1;
            countString = '';
            while( !( doc.charAt( a + _char ) === ')' ) && ( a + _char ) < doc.length ) {
                wString = `${ wString }${ doc.charAt( a + _char ) }`;   // add character to wString
                _char += 1;
            }   // leaves _char equal to the location of ')' ( or _char = doc.length )
            if( a > 1 && multiplierChars.includes( doc.charAt( a - 1 ) ) && countChars.includes( doc.charAt( a - 2 ) ) ) {
                for( let b = 2 ; a - b >= 0 && countChars.includes( doc.charAt( a - b ) ) && b < 5 ; b += 1 ) {
                    countString = `${ doc.charAt( a - b ) }${ countString }`;
                }
            } else if( a + _char + 2 < doc.length && multiplierChars.includes( doc.charAt( a + _char + 1 ) ) && countChars.includes( doc.charAt( a + _char + 2 ) ) ) {
                for( let b = 2 ; a + _char + b < doc.length && countChars.includes( doc.charAt( a + _char + b ) ) && b < 5 ; b += 1 ) {
                    countString = `${ countString }${ doc.charAt( a + _char + b ) }`;
                }
            } else if( a > 0 && countChars.includes( doc.charAt( a - 1 ) ) ) {
                for( let b = 1 ; a - b >= 0 && countChars.includes( doc.charAt( a - b ) ) && b < 4 ; b += 1 ) {
                    countString = `${ doc.charAt( a - b ) }${ countString }`;
                }
            } else if( a + _char + 1 < doc.length && countChars.includes( doc.charAt( a + _char + 1 ) ) ) {
                for( let b = 1 ; a + _char + b < doc.length && countChars.includes( doc.charAt( a + _char + b ) ) && b < 4 ; b += 1 ) {
                    countString = `${ countString }${ doc.charAt( a + _char + b ) }`;
                }
            } else {
                countString = '1';
            }
            wString = wString.trim();
            for( let c = 0 ; c < parseInt( countString ) ; c += 1 ) {
                list.push( ( new Whisp( wString, list.length ) ) );
            }
            a += _char + 1;     // jump forward to after ')'
        }
    }
    return list;
}


const whispList = readWhispDoc( whispDoc );
console.log(whispList)

function draw() {
    const w = getWidth();
    const h = getHeight();

    timeObj.lastDrawn = timeObj.current;
    timeObj.current = ( new Date() ).getTime() / 1000;
    timeObj.delta = timeObj.current - timeObj.lastDrawn;
    
    mouseObj.speed = pointDistance( prevMouseCoords[0], prevMouseCoords[1], mouseObj.x, mouseObj.y ) / timeObj.delta;
    mouseObj.direction = ( !( mouseObj.speed === 0 ) 
                ? pointDirection( prevMouseCoords[0], prevMouseCoords[1], mouseObj.x, mouseObj.y ) : 0 );

    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, w, h); // clear canvas
    
    whispList.forEach( whisp => {
        whisp.step();
    } );
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = `rgba(0, 0, 0, ${ shadowAlpha } )`;
    ctx.fillRect( 0, 0, w, h );

    prevMouseCoords = [ mouseObj.x, mouseObj.y ];
    window.requestAnimationFrame(draw);
}

function init() {
    handleResize();
    window.requestAnimationFrame(draw);
    window.addEventListener( 'resize', handleResize, );
    window.onmousemove = handleMouseMove;
    window.onmouseup = handleMouseUp;
    window.onmousedown = handleMouseDown;
}

whispSurfaces[0].onload = init;