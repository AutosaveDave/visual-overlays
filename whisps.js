const canvasList = [];
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

function getWidth( canvasEl ) { return canvasEl.clientWidth; }
function getHeight( canvasEl ) { return canvasEl.clientHeight; }
const degToRad = deg => 2 * Math.PI * deg / 360; 
const modVals = {       // increase from [0] (zero) to [10] (max)
    maxSpeed: [ 0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000 ],
    acceleration: [ 0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500 ],
    turnSpeed: [ 0, degToRad( 40 ), degToRad( 80 ), degToRad( 120 ), degToRad( 160 ), degToRad( 200 ), degToRad( 240 ), degToRad( 280 ), degToRad( 320 ), degToRad( 360 ), degToRad( 400 ) ],
}
const moveTypes = [ 'swim', 'drift', 'glide', 'crawl', 'weave', 'float' ];    // movement types - not used yet

const mods = {
    whisp: {
        default: {
            main:{
                type: 'whisp', 
                lightColor: 'mystic',
                minLightScale: 2, maxLightScale: 5, 
                minWhispScale: 1, maxWhispScale: 1,
            },
            behaviors: [ {
                actions: [ { 
                    act: 'follow', target: 'cursor', 
                    maxSpeed: modVals.maxSpeed[5], 
                    acceleration: modVals.acceleration[5],
                    turnSpeed: modVals.turnSpeed[4]
                } ],
            } ],
        },
        fastest: { bmod: { actions: {maxSpeed: modVals.maxSpeed[10], acceleration: modVals.acceleration[10], } } },
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
    largest: { default: { main: { minLightScale: 10, maxLightScale: 12, minWhispScale: 1, maxWhispScale: 1, }}},
    verylarge: { default: { main: { minLightScale: 9, maxLightScale: 11, minWhispScale: 1, maxWhispScale: 1, }}},
    larger: { default: { main: { minLightScale: 8, maxLightScale: 10, minWhispScale: 1, maxWhispScale: 1, }}},
    large: { default: { main: { minLightScale: 7, maxLightScale: 9, minWhispScale: 1, maxWhispScale: 1, }}},
    largeish: { default: { main: { minLightScale: 6, maxLightScale: 8, minWhispScale: 1, maxWhispScale: 1, }}},
    smallish: { default: { main: { minLightScale: 5, maxLightScale: 7, minWhispScale: 1, maxWhispScale: 1, }}},
    small: { default: { main: { minLightScale: 4, maxLightScale: 6, minWhispScale: 1, maxWhispScale: 1, }}},
    smaller: { default: { main: { minLightScale: 3, maxLightScale: 4, minWhispScale: 1, maxWhispScale: 1, }}},
    small: { default: { main: { minLightScale: 2, maxLightScale: 3, minWhispScale: 1, maxWhispScale: 1, }}},
    verysmall: { default: { main: { minLightScale: 1, maxLightScale: 2, minWhispScale: 1, maxWhispScale: 1, }}},
    smallest: { default: { main: {minLightScale: 0.25, maxLightScale: 0.75, minWhispScale: 1, maxWhispScale: 1, }}},
};

const countChars = [ '0', '1', '2', '3', '4', '5', '6', '7', '8', '9' ];
const multiplierChars = [ 'x', '*', 'X' ];
const alphaChars = [ 'A', 'a', '%' ];
const zChars = [ 'Z', 'z' ];
const nameChars = [ '=', '/', ':' ];

function getPropType( typeCode ) {
    const type = typeCode.toUpperCase();
    return ( whispData.propTypes.hasOwnProperty(type) 
            ? whispData.propTypes[type] 
            : whispData.propTypes.default );
}

function getSpawnLocValue( [ name, ...args ] ) {
    const sides = name.split( '' );
    let _range = [];
    args.forEach( arg => { _range.push( parseInt( arg ) ); } );
    _range.sort( ( a, b ) => a - b );
    const _sides = ( ( sides.length > 0 ) ? sides : ['t','b','l','r'] );
    const _start = ( ( _range.length > 0 ) ? _range[0] : 0 );
    const _end = ( ( _range.length > 1 ) ? _range[1] : 100 );
    const _result = { sides: [ ..._sides ], range: { start: _start, end: _end } }
    return _result;
}

function getBehaviorValue( args, _i, cIndex ) {
    let actions = [];
    let conditions = [];
    args.forEach( segment => {
        const values = segment.split( '.' );
        const [ prefix, ...vals ] = values;
        if( prefix === 'if' || prefix === 'on' || prefix === 'when' || prefix === 'while' ) {
            conditions.push( new Condition( vals, _i, cIndex ) );
        } else {
            actions.push( new Action( values, _i, cIndex ) );
        }
    } );
    const behavior = { actions: actions, conditions: conditions };
    return behavior;
}
function rndRange( min, max ) { return Math.floor( 100 * ( min + ( max - min ) * Math.random() ) ) / 100; }

function getScaleValue( args ) {
    args.sort( ( a, b ) => a - b );
    let result = { minLightScale: 3, maxLightScale: 3, lightScale: 3 };
    if( args.length > 1  && !( args[0] === args[1] ) ) {
        result.minLightScale = args[0]; result.maxLightScale = args[1];
        result.lightScale = rndRange( args[0], args[1] );
    }
    if( args.length === 1 || args[0] === args[1] ) {
        result.minLightScale = args[0]; result.maxLightScale = args[0]; 
        result.lightScale = args[0];
    }
    return result;
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
function newSpawnCoords ( spawnLocArray, canvasEl, spawnMargin ) { 
    const spawnLoc = ( ( spawnLocArray.length > 0 ) ? spawnLocArray 
                : [ { sides: ['t','b','l','r'], range: { start: 0, end: 100 } } ] );
    const [ w, h ] = [ getWidth( canvasEl ), getHeight( canvasEl ) ];
    const sideSpawn = { 
        t: { lowX: 0, highX: w, lowY: -spawnMargin, highY: -spawnMargin }, 
        b: { lowX: 0, highX: w, lowY: h + spawnMargin, highY: h + spawnMargin },
        l: { lowX: -spawnMargin, highX: -spawnMargin, lowY: 0, highY: h }, 
        r: { lowX: w + spawnMargin, highX: w + spawnMargin, lowY: 0, highY: h }, 
    };
    
    spawnLoc.forEach( loc => {
        (loc.sides).forEach( side => {
            if( side === 'b' || side === 't' ) {
                sideSpawn[ side ] = { 
                    lowX: Math.floor( w * loc.range.start / 100 ),
                    highX: Math.floor( w * loc.range.end / 100 )
                };
            } else if( side === 'r' || side === 'l' ) {
                sideSpawn[ side ] = { 
                    lowY: Math.floor( h * loc.range.start / 100 ),
                    highY: Math.floor( h * loc.range.end / 100 )
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
                    result.y = ( ( s.side === 't' ) ? -spawnMargin : h + spawnMargin ); 
            }
            else if( s.side === 'l' || s.side === 'r' ) { 
                result.x = ( ( s.side === 'l' ) ? -spawnMargin : w + spawnMargin ); 
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

const fixArgs = args => {
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
    constructor( _args, _i, cIndex ) {
        this.canvasIndex = cIndex;
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
                        [ x1, y1 ] = canvasList[ this.canvasIndex ].whispList[this.whispIndex].getTargetCoords( this.subject );
                        distance = pointDistance( x1, y1, canvasList[ this.canvasIndex ].whispList[this.whispIndex].coords.x, canvasList[ this.canvasIndex ].whispList[this.whispIndex].coords.y );
                        return ( !reverseLogic ? ( distance <= this.max && distance >= this.min ) 
                                : !( distance <= this.max && distance >= this.min ) );
                    case 'speed':
                        subjectSpeed = ( canvasList[ this.canvasIndex ].whispList[this.whispIndex].getTargetVector( this.subject ) )[0];
                        return ( subjectSpeed <= this.max && subjectSpeed >= this.min );
                    case 'direction':
                        subjectDirection = ( canvasList[ this.canvasIndex ].whispList[this.whispIndex].getTargetVector( this.subject ) )[1];
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
    constructor( _args, _i, cIndex ) { 
        if( Array.isArray( _args ) ) { 
            Object.assign( this, getActionArgsObj( _args, _i ) );
        } else if( typeof _args === 'object' ) {
            Object.assign( this, _args );
        }
        Object.keys( this ).forEach( k => {
            if( this.hasOwnProperty( k )  && !( typeof this[ k ] === 'string' ) )
            this[ k ] = rndShift( this[ k ], rndActionShifts[ k ] )
        } );
        Object.assign( this, { whispIndex: _i, canvasIndex: cIndex } );
    }
    perform() {  
        const args = [];
        actionArgNames[ this.act ].forEach( argName => { args.push( this[ argName ] ) } );
        switch( this.act ) {
            case 'follow': canvasList[ this.canvasIndex ].whispList[this.whispIndex].follow( args ); break;
            case 'drift': break;
            case 'turn': break;
            case 'orbit': break;
            case 'flee': canvasList[ this.canvasIndex ].whispList[this.whispIndex].flee( args ); break;
            default: break;
        }
    }
}

function getModObject( args, whispIndex, cIndex ) {
    let modsObj = { main: {}, behaviors: [] };
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
                                _b.conditions.forEach( _c => { newC.push( ( new Condition( _c, whispIndex, cIndex ) ) ); } );
                            if( _b.hasOwnProperty( 'actions' ) && Array.isArray( _b.actions ) )
                                _b.actions.forEach( _a => { newA.push( ( new Action( _a, whispIndex, cIndex ) ) ); } );
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
                                            behav.actions.push( new Action( _a, whispIndex, cIndex ) );
                                        } );
                                    }
                                    if( mods[ type ][s].behavior.hasOwnProperty( 'conditions' ) ) {
                                        mods[ type ][s].behavior.conditions.forEach( _c => {
                                            behav.conditions.push( new Condition( _c, whispIndex, cIndex ) );
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
        modsObj.main.lightColor = getColor( modsObj.main.lightColor );
    }
    if( modsObj.main.hasOwnProperty( 'minLightScale' ) && modsObj.main.hasOwnProperty( 'maxLightScale' ) ) 
        modsObj.main.lightScale = rndRange( modsObj.main.minLightScale, modsObj.main.maxLightScale );
    return modsObj;
}

class Whisp {
    constructor( whispString, i, cIndex, canvEl, spawnMargin ) {
        const data = whispString.split( ' ', 20 );
        this.canvasIndex = cIndex;
        this.behaviors = [];
        const spawnData = [];
        data.forEach( phrase => { 
            const [ phraseType, phraseName, ...args ] = phrase.split( '-', 20 );
            const propType = getPropType( phraseType );
            switch( phraseType.toUpperCase() ) {          
                case 'B': // BEHAVIOR - add to behavior ( actions[] & conditions[] ) to behaviors[]
                    this.behaviors.push( getBehaviorValue( [ phraseName, ...args ], i, cIndex ) ); 
                    break;
                case 'WS': case 'LS': // WHISP SIZE or LIGHT SIZE - set size (x32px) of whisp or light
                    Object.assign( this, getScaleValue( fixArgs( [ phraseName, ...args ] ) ) );
                    break;
                case 'WC': case 'LC': // WHISP COLOR or LIGHT COLOR - set color from colorHues/colorSets
                    this[ propType ] = getColor( phraseName.toLowerCase() );
                    break;
                case '@': // SPAWN LOCATION - set which sides/ coordinate ranges where whisp can spawn
                    spawnData.push( getSpawnLocValue( [ phraseName, ...args ] ) ); 
                    break;
                case '&': case 'T':
                case 'M' : case 'MOD': case 'MODS': // MODS - simpler way to change whisp settings
                    const modObject = getModObject( [ phraseName, ...args ], i, cIndex );
                    Object.assign( this, modObject.main );
                    if( modObject.hasOwnProperty( 'behaviors' ) && Array.isArray( modObject.behaviors ) ) {
                        modObject.behaviors.forEach( _b => {
                            this.behaviors.push( _b );
                        } );
                    }
                    break;
                default:
                    const modObject2 = getModObject( [ phraseType, phraseName, ...args ], i, cIndex );
                    Object.assign( this, modObject2.main );
                    if( modObject2.hasOwnProperty( 'behaviors' ) && Array.isArray( modObject2.behaviors ) ) {
                        modObject2.behaviors.forEach( _b => {
                            this.behaviors.push( _b );
                        } );
                    }
                    break;
            }
        } ); 
        if( spawnData.length === 0 ) {
            spawnData.push( getSpawnLocValue( [ 'tblr', '0', '100' ] ) );
        }
        this.spawnLoc = spawnData;
        const sc = newSpawnCoords( spawnData, canvEl, spawnMargin );
        this.coords = { x: sc.x, y: sc.y };
        this.xspeed = 0;
        this.yspeed = 0;
        this.id = i;
    }
    
    // ------ CALCULATION METHODS -------------------------------------------
    getNearestWhispIndex() {
        let nearest = 9999999;
        let nearestIndex = -1;
        canvasList[ this.canvasIndex ].whispList.forEach( ( _whisp, _i ) => {
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
    getNearestWhisp() { return canvasList[ this.canvasIndex ].whispList[ this.getNearestWhispIndex() ]; }
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
        const mouseObj = this.getMouseObj();
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

    getTimeObj() {
        return { current: canvasList[ this.canvasIndex ].tCurrent, 
                lastDrawn: canvasList[ this.canvasIndex ].tLastDrawn,
                delta: canvasList[ this.canvasIndex ].tDelta
        };
    }
    getMouseObj() {
        return { x: canvasList[ this.canvasIndex ].mx, 
                y: canvasList[ this.canvasIndex ].my,
                mousedown: canvasList[ this.canvasIndex ].mdown, 
                mouseup: canvasList[ this.canvasIndex ].mup,
                speed: canvasList[ this.canvasIndex ].mspeed,
                direction: canvasList[ this.canvasIndex ].mdirection
        };
    }

    // ------ MOVEMENT METHODS -----------------------------------------------
    moveStep() {
        const timeObj = this.getTimeObj();
        this.coords.x += this.xspeed * timeObj.delta;
        this.coords.y += this.yspeed * timeObj.delta;
    }
    turn( turnAngle ) {
        const timeObj = this.getTimeObj();
        const adjustedAngle = turnAngle * timeObj.delta;
        const [ _speed, _dir ] = this.getVector();
        [ this.xspeed, this.yspeed ] = this.getSpeedXY( [ _speed, _dir + adjustedAngle ] )
    }
    turnTowardDirection( targetDirection, turnAngle ) {
        const timeObj = this.getTimeObj();
        const maxAngle = turnAmount( this.getDirection(), targetDirection );
        this.turn(( Math.abs( turnAngle * timeObj.delta ) > Math.abs( maxAngle ) 
                ? maxAngle / timeObj.delta : Math.sign( maxAngle ) * turnAngle ) );
    }
    turnTowardPoint( _x, _y, turnAngle ) {
        const timeObj = this.getTimeObj();
        const maxAngle = turnAmount( this.getDirection(), pointDirection( this.coords.x, this.coords.y, _x, _y ) );
        this.turn( ( Math.abs( turnAngle * timeObj.delta ) > Math.abs( maxAngle ) 
                ? maxAngle / timeObj.delta : Math.sign( maxAngle ) * turnAngle ) );
    }
    turnAwayFromPoint( _x, _y, turnAngle ) {
        const timeObj = this.getTimeObj();
        const maxAngle = turnAmount( this.getDirection(), pointDirection( _x, _y, this.coords.x, this.coords.y ) );
        this.turn( ( Math.abs( turnAngle * timeObj.delta ) > Math.abs( maxAngle ) 
                ? maxAngle / timeObj.delta : Math.sign( maxAngle ) * turnAngle ) );
    }
    slowDown( _amount, _minSpeed ) {
        const timeObj = this.getTimeObj();
        const [ _speed, _dir ] = this.getVector();
        const dSpeed = ( _speed - _amount * timeObj.delta >= _minSpeed 
                ? _amount * timeObj.delta : _speed - _minSpeed );
        [ this.xspeed, this.yspeed ] = this.getSpeedXY( [ _speed - dSpeed, _dir ] );
    }
    speedUp( _amount, _maxSpeed ) {
        const timeObj = this.getTimeObj();
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
        const gradient = canvasList[ this.canvasIndex ].ctx.createRadialGradient( this.coords.x, this.coords.y, 0, this.coords.x, this.coords.y, 32 * this.lightScale );
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
        canvasList[ this.canvasIndex ].ctx.globalCompositeOperation = 'screen';
        canvasList[ this.canvasIndex ].ctx.beginPath();
        canvasList[ this.canvasIndex ].ctx.fillStyle = this.getLightGradient();
        canvasList[ this.canvasIndex ].ctx.ellipse( this.coords.x, this.coords.y, 32 * this.lightScale, 32 * this.lightScale, 0, 0, 2 * Math.PI );
        canvasList[ this.canvasIndex ].ctx.fill();
    }
    step() {
        this.executeBehaviors();
        this.moveStep();
        this.drawLight();
    }
}



// const whispList = readWhispDoc( whispDoc ); 
// console.log(whispList);

const getWhispDoc = ( wSurface ) => {
    if( typeof wSurface.dataset.whisps === 'string' ) {
        return wSurface.dataset.whisps;
    }
    return "10x(whisp)";
}

function createCanvasList() {
    const whispSurfaces = window.document.getElementsByClassName("whisps");
    for( let a = 0 ; a < whispSurfaces.length ; a += 1 ) {
        canvasList.push( new WhispCanvas( whispSurfaces[a], a ) );
    }
}

function readWhispDoc( doc, canvasIndex, canvEl, spawnMargin ) {
    const list = [];
    let alphaVal = -1;
    let zVal = false;
    let _char = 1;
    let count = 0;
    let nameString = '';
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
                list.push( new Whisp( wString, list.length, canvasIndex, canvEl, spawnMargin ) );
            }
            a += _char + 1;     // jump forward to after ')'
        } else if( alphaVal === -1 && alphaChars.includes( doc.charAt( a ) ) ) {
            countString = '';
            if( countChars.includes( doc.charAt( a + 1 ) ) ) {
                for( let d = 1 ; d < 3 && a + d < doc.length && countChars.includes( doc.charAt( a + d ) ) ; d += 1 ) {
                    countString = `${ countString }${ doc.charAt( a + d ) }`;
                }
            } else if( countChars.includes( doc.charAt( a - 1 ) ) ) {
                for( let d = 1 ; d < 3 && a - d >= 0 && countChars.includes( doc.charAt( a - d ) ) ; d += 1 ) {
                    countString = `${ doc.charAt( a - d ) }${ countString }`;
                }
            } else {
                countString = '100';
            }
            alphaVal = parseInt( countString ) / 100;
        } else if( zVal === false && zChars.includes( doc.charAt( a ) ) ) {
            countString = '';
            if( [ ...countChars, '-' ].includes( doc.charAt( a + 1 ) ) ) {
                for( let d = 1 ; d < 4 && a + d < doc.length && [ ...countChars, '-' ].includes( doc.charAt( a + d ) ) ; d += 1 ) {
                    countString = `${ countString }${ doc.charAt( a + d ) }`;
                }
            } else if( [ ...countChars, '-' ].includes( doc.charAt( a - 1 ) ) ) {
                for( let d = 1 ; d < 4 && a - d >= 0 && [ ...countChars, '-' ].includes( doc.charAt( a - d ) ) ; d += 1 ) {
                    countString = `${ doc.charAt( a - d ) }${ countString }`;
                }
            } else {
                countString = '1';
            }
            zVal = parseInt( countString );
        } else if( nameChars.includes( doc.charAt( a ) ) ) {
            let charOffset = 0;
            for( let d = 1 ; d < 20 && a + d < doc.length && 
                    ( [ ...countChars, '-', '_' ].includes( doc.charAt( a + d ) ) 
                    || !( doc.charAt( a + d ).toLowerCase() === doc.charAt( a + d ).toUpperCase() ) ) ;
                    d += 1 
            ) {
                nameString = `${nameString}${doc.charAt( a + d )}`;
                charOffset = d;
            }
            a += charOffset + 1;
        }
    }
    alphaVal = ( !( alphaVal === -1 ) ? alphaVal : 1 );
    zVal = ( !( zVal === false ) ? zVal : 1 );
    return { wList: list, aVal: alphaVal, zVal: zVal, nameVal: nameString };
}

class WhispCanvas {
    constructor( wSurface, i ) {
        const sMargin = 120;
        const wDoc = getWhispDoc( wSurface );
        const wid = `whisps-canvas-${ i }`;
        const canvas = window.document.createElement("canvas");
        canvas.id = wid;
        canvas.style.position = "absolute";
        canvas.style.top = 0;
        canvas.style.left = 0;
        canvas.style.mixBlendMode= 'multiply';
        canvas.style.height = '100%';
        canvas.style.width = "100%";
        canvas.style.zIndex = 1;
        canvas.style.pointerEvents = 'none';
        wSurface.appendChild( canvas );
        const canv = window.document.getElementById(wid);
        this.surface = wSurface;
        this.canvasEl = canv;
        this.canvasIndex = i;
        const { wList, aVal, zVal, nameVal } = readWhispDoc( wDoc, i, canv, sMargin );
        this.whispList = wList;
        this.shadowAlpha = aVal;
        this.canvasName = nameVal;
        canv.style.zIndex = zVal;
        this.spawnMargin = sMargin; // how far off-screen to spawn whisps
        this.ctx = canv.getContext("2d");
        
        this.tLastDrawn = ( new Date() ).getTime() / 1000 - ( 1000 / 60 );
        this.tCurrent = ( new Date() ).getTime() / 1000;
        this.tDelta = 1000 / 60;
        this.mx = getWidth( canv ) / 2;     // mouse-x
        this.my = getHeight( canv ) / 2;    // mouse-y
        this.mdown = false; this.mup = false;
        this.mspeed = 0; this.mdirection = 0;
        this.mxPrev = getWidth( canv ) / 2;
        this.myPrev = getHeight( canv ) / 2;

        this.isOn = true;
    }

    toggleOnOff() { 
        this.isOn = !this.isOn; 
        this.reset();
        if( this.isOn === true ) {
            window.requestAnimationFrame( () => { this.draw(); } ); 
        }
    } 
    setOnOff( e ) { 
        const targetEl = e.target;
        const targetType = targetEl.type;
        const typeProps = {
            'checkbox': 'checked',
        } ;
        this.isOn = targetEl[ typeProps[targetType] ];
        this.reset();
        if( this.isOn === true ) {
            window.requestAnimationFrame( () => { this.draw(); } ); 
        }
    }
    turnOn() { 
        this.isOn = true; 
        this.reset(); 
        window.requestAnimationFrame( () => { this.draw(); } );
    }
    turnOff() {
        this.isOn = false;
        this.reset();
    }
    //const closeButton = window.document.createElement( 'button' );
    handleResize() { 
        this.canvasEl.height = getHeight( this.canvasEl ); 
        this.canvasEl.width = getWidth( this.canvasEl ); 
    }
    handleMouseMove( e ) { 
        const time = ( new Date() ).getTime() / 1000;
        this.mxPrev = this.mx;
        this.myPrev = this.my;
        this.mx = e.clientX; 
        this.my = e.clientY; 
        
    };
    handleMouseUp( e ) { this.mup = true; };
    handleMouseDown( e ) { this.mdown = true; };

    draw() {
        const w = getWidth( this.canvasEl );
        const h = getHeight( this.canvasEl );
    
        this.tLastDrawn = this.tCurrent;
        this.tCurrent = ( new Date() ).getTime() / 1000;
        this.tDelta = this.tCurrent - this.tLastDrawn;
        
        this.mspeed = pointDistance( this.mxPrev, this.myPrev, this.mx, this.my ) / this.tDelta;
        this.mdirection = ( !( this.mspeed === 0 ) 
                    ? pointDirection( this.mxPrev, this.myPrev, this.mx, this.my ) : 0 );
    
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.clearRect( 0, 0, w, h ); // clear canvas
        
        this.whispList.forEach( whisp => {
            whisp.step();
        } );
        this.ctx.globalCompositeOperation = "screen";
        this.ctx.fillStyle = `rgba(0, 0, 0, ${ this.shadowAlpha } )`;
        this.ctx.fillRect( 0, 0, w, h );
    
        this.mxPrev = this.mx;
        this.myPrev = this.my;
        if( this.isOn ) {
            window.requestAnimationFrame( () => { this.draw(); } );
        } else {
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.clearRect( 0, 0, w, h ); // clear canvas
        }
    }

    reset() {
        this.whispList.splice( 0, this.whispList.length );
        const { wList, aVal, zVal, nameVal } = readWhispDoc( getWhispDoc( this.surface ), this.canvasIndex, this.canvasEl, this.spawnMargin );
        this.whispList = wList;
        this.canvasName = nameVal
        this.shadowAlpha = aVal;
        this.canvasEl.style.zIndex = zVal;
        this.tCurrent = ( new Date() ).getTime() / 1000;
        this.tLastDrawn = ( new Date() ).getTime() / 1000;
        this.tDelta = 0;
        console.log(this)
    }
    initControls() {
        if( !( this.canvasName === '' ) ) {
            // 'whisps-{name}-{trigger}-{effect}'
            const cBase = `whisps-${ this.canvasName }`;
            const cTriggers = {
                'click': [ {
                    ev: 'onclick',
                    functions: {
                        'onoff': () => { this.toggleOnOff(); },
                        'reset': () => { this.reset(); },
                    },
                    default: () => { this.toggleOnOff(); },
                } ],
                'set': [ {
                    ev: 'oninput',
                    functions: {
                        'onoff': e => { this.setOnOff( e ) },
                    },
                    default: e => { this.setOnOff( e ) },
                } ],
                'hover': [
                    {
                        ev: 'onmouseover',
                        functions: { 'onoff': () => { this.turnOn(); }, },
                        default: () => { this.turnOn(); },
                    },
                    {
                        ev: 'onmouseout',
                        functions: { 'onoff': () => { this.turnOff(); }, },
                        default: () => { this.turnOff(); },
                    },
                ],
            };
            Object.keys( cTriggers ).forEach( key => {
                cTriggers[ key ].forEach( effect => {
                    Object.keys( effect.functions ).forEach( funct => {
                        const controllers = window.document.getElementsByClassName( `${ cBase }-${ key }-${ funct }` );
                        for( let c = 0 ; c < controllers.length ; c += 1 ) {
                            controllers[ c ][ effect.ev ] = effect.functions[ funct ];
                        }
                        if( effect.hasOwnProperty( 'default' ) ) {
                            const cDefault = window.document.getElementsByClassName( `${ cBase }-${ key }` );
                            for( let c = 0 ; c < cDefault.length ; c += 1 ) {
                                cDefault[ c ][ effect.ev ] = effect.default;
                            }
                        }
                        
                    } );
                } );
            } );
        }
    }
    init() {
        this.handleResize();
        window.requestAnimationFrame( () => { this.draw(); } );
        window.addEventListener( 'resize', () => { this.handleResize() } );
        window.onmousemove = e => { this.handleMouseMove( e ); };
        window.onmouseup = e => { this.handleMouseUp( e ); };
        window.onmousedown = e => { this.handleMouseDown( e ); };
        this.initControls();
    }
}

createCanvasList();
// whispSurfaces[0].onload = init;
canvasList.forEach( canv => { canv.init(); } );