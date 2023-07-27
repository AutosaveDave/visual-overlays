const canvas = document.createElement("canvas");
canvas.id="whisps-canvas";
canvas.style.position = "fixed";
canvas.style.mixBlendMode= 'multiply';
canvas.style.height = "100%";
canvas.style.width = "100%";
canvas.style.zIndex = 1;

document.body.appendChild(canvas);
const canvasEl = document.getElementById("whisps-canvas");

const getWidth = () => canvasEl.clientWidth;
const getHeight = () => canvasEl.clientHeight;
const handleResize = () => { canvasEl.height = getHeight(); canvasEl.width = getWidth(); };

const spawnMargin = 24; // how far off-screen to spawn whisps

function init() {
    handleResize();
    window.requestAnimationFrame(draw);
    window.addEventListener('resize', handleResize);
}

const colorHues = { 'red':0, 'orange':30, 'yellow':60, 'green':100, 'sea':150, 'cyan':180, 
    'sky':200, 'blue':240, 'indigo':260, 'purple':280, 'pink':300, 'fuschia':335 };

// whispString: a sequence of space-separated phrases describing 
//      the desired appearance/behavior of the whisp.
//          Each phrase is in the following format:
//  whispString:     '{ propType }-{ propName }-{ (arg1?) }-{ (argN?) }'
//  behaviorString:  "B-{ action }-{ condition }"
//      actionString:    "{ actionType }.{ arg1 }.{ arg2 }.{ arg3 }"     (separated by '.' or ',')
//      conditionString: "{ conditionType }.{ arg1 }.{ arg2 }.{ arg3 }"  (separated by '.' or ',')
//  spawnLocString:      "@-{ whichSides }.{ startRangePercent }.{ endRangePercent }"          

const whispData = {
    propTypes: {
        'T' :   'type',
        'B' :   'behavior',
        'L' :   'lightMap',
        'LS':   'lightScale',
        'LC':   'lightColor',
        'W' :   'whispImage',
        'WS':   'whispScale',
        'WC':   'whispColor',
        '@' :   'spawnLoc',
        default: 'type',
    },
    whispTypeProps: {
        default: {},
        'whisp': {
            behaviors: [],
            lightScale: 1,
            lightColor: '#FFFFFF',
            whispScale: 1,
            whispColor: '#FFFFFF',
            spawnLoc: 'allSides',
        }
    },
    behaviors: {
        default: () => {},
        'follow': () => {},
    },
    conditions: {
        default: () => true,
        'always': () => true,
    }
}

function getPropType( typeCode ) {
    const type = typeCode.toUpperCase();
    return ( whispData.propTypes.hasOwnProperty(type) 
            ? whispData.propTypes[type] 
            : whispData.propTypes.default );
}

function getActionValue( actionString ) {
    const [ name, ...args] = actionString.split('.');
    return { act: whispData.behaviors[name], args: args };
}
function getConditionValue( conditionString ) {
    const [ name, ...args] = conditionString.split('.');
    return { eval: whispData.behaviors[name], args: args };
}
function getSpawnLocValue( name, args ) {
    const sides = name.split('');
    const range = [];
    args.forEach( arg => { range.push( parseInt( arg ) ); } );
    range.sort( ( a, b ) => a - b );
    return { sides: ( ( sides.length > 0 ) ? sides : ['t','b','l','r'] ), 
        range: { start: ( range[0] ? range[0] : 0 ), end: ( range[1] ? range[1] : 100 ) } 
    };
}

function getPropValue( typeCode, name, args ) {
    const type = typeCode.toUpperCase();
    switch( type ) {
        case 'B':
            return ( whispData.behaviors.hasOwnProperty( name )
                    ? { action: getActionValue( name ), condition: ( args[0] ? getConditionValue( args[0] ) : whispData.conditions.default ) }
                    : { ...whispData.behaviors.default, condition: whispData.conditions.default } );
        case 'L': 
            return ( lightMapImages.hasOwnProperty( name ) 
                    ? lightMapImages[ name ] 
                    : lightMapImages.default );
        case 'WS': case 'LS':
            return ( !( isNaN( parseInt( name ) ) ) ? parseInt( name ) : 1 );
        case '@':
            return getSpawnLocValue( name, args );
        default: return name;
    }
}

function newSpawnCoords ( spawnLocArray ) { 
    const spawnLoc = ( ( spawnLocArray.length > 0 ) 
            ? spawnLocArray : [ { sides: ['t','b','l','r'], range: { start:0, end:100 } } ] );
    const sideSpawn = { 
        t: { lowX: 0, highX: getWidth(), lowY: -spawnMargin, highY: -spawnMargin }, 
        b: { lowX: 0, highX: getWidth(), lowY: getHeight() + spawnMargin, highY: getHeight() + spawnMargin },
        l: { lowX: -spawnMargin, highX: -spawnMargin, lowY: 0, highY: getHeight()}, 
        r: { lowX: getWidth() + spawnMargin, highX: getWidth() + spawnMargin, lowY: 0, highY: getHeight() }, 
    };
    const getSideLength = ( whichSide ) => {
        if( whichSide.side === 't' || whichSide.side === 'b' ) { 
            return whichSide.highX - whichSide.lowX; 
        }
        else if( whichSide.side === 'l' || whichSide.side === 'r' ) { 
            return whichSide.highY - whichSide.lowY; 
        }
    }
    spawnLoc.forEach( loc => {
        loc.sides.forEach( side => {
            if( side === 'b' || side === 't' ) {
                sideSpawn[ side ] = { 
                    lowX: getWidth() * loc.range.start/100,
                    highX: getWidth()* loc.range.end/100
                };
            } else if( side === 'r' || side === 'l' ) {
                sideSpawn[ side ] = { 
                    lowY: getHeight() * loc.range.start/100,
                    highY: getHeight() * loc.range.end/100
                };
            }
        } );
    } );
    const sideSpawnArray = [ { ...sideSpawn['t'], side: 't' }, 
                            {...sideSpawn['b'], side: 'b'}, 
                            {...sideSpawn['l'], side: 'l'}, 
                            {...sideSpawn['r'], side: 'r'} ];
    let totalWeight = 0;
    sideSpawnArray.forEach( s => { totalWeight += getSideLength( s ); } );
    const rand = totalWeight * Math.random();
    let result = { x: 0, y: 0 };
    let min = 0;
    sideSpawnArray.forEach( s => { 
        const w = getSideLength( s );
        if( rand >= min && rand < min + w ) {
            if( s.side === 't' || s.side === 'b' ) { 
                result = { x: rand - min + s.lowX , 
                        y: ( s.side === 't' ? -spawnMargin : getHeight() + spawnMargin ) 
                }; 
            }
            else if( s.side === 'l' || s.side === 'r' ) { 
                result = { x: ( s.side === 'l' ? -spawnMargin : getWidth() + spawnMargin ), 
                    y: rand - min + s.lowY 
                }; 
            }
        }
        min += w;
    } );
    return result;
}

/*
    BEHAVIORS:
    follow
*/

class Whisp {
    constructor( whispString ) {
        const data = whispString.split( ' ', 20 );
        data.forEach( phrase => { 
            const [ phraseType, phraseName, ...args ] = phrase.split( '-', 4 );
            const propType = getPropType( phraseType );
            this.spawnLoc = [];
            this.behaviors = [];
            switch( phraseType.toUpperCase() ) {          
                case 'T':                                                        // if 'T' prefix used, 
                    Object.assign( this, whispData.whispTypeProps[ phraseName ] ); //add default props for specified type
                    this[ propType ] = getPropValue( phraseType, phraseName, args );
                    break;
                case 'B', '@': this[ propType ].push( getPropValue( phraseType, phraseName, args ) ); break;
                default: this[ propType ] = getPropValue( phraseType, phraseName, args );
            }
        } );
        const coords = newSpawnCoords(this.spawnLoc);
        this.x = coords.x;
        this.y = coords.y;
    }
}

const whispList = [ new Whisp("T-whisp LS-4 LC-yellow WS-2 WC-yellow @-tblr-25-75" ),
                    new Whisp("T-whisp LS-2 LC-cyan WS-2 WC-cyan @-rlbt-40-60" ),
                    new Whisp("T-whisp LS-5 LC-white WS-2 WC-white @-lr-0-0 @-tb-0-100" ),
                    new Whisp("T-whisp LS-2 LC-fuschia WS-2 WC-fuschia @-tb-0-0 @-rl-0-100" )
                ];
whispList.forEach( whispy => { 
    whispy.x = 40+Math.random()*(getWidth()-80); 
    whispy.y = 40+Math.random()*(getHeight()-80); 
} )

const getLightGradient = ( _x, _y, _lightScale, _lightColor, ctx ) => {
    const gradient = ctx.createRadialGradient(_x, _y, 0, 
                        _x, _y, 32 * _lightScale );
    const startColor = ( !( _lightColor === 'white' ) 
                        ? `hsla(${colorHues[_lightColor]},100%,50%,1)`
                        : `hsla(0,100%,100%,1)` );
    const endColor = ( !( _lightColor === 'white' ) 
                        ? `hsla(${colorHues[_lightColor]},100%,50%,0)`
                        : `hsla(0,100%,100%,0)` );
    gradient.addColorStop(0, startColor );
    gradient.addColorStop(0.1, startColor );
    gradient.addColorStop(1, endColor );
    return gradient;
};

function draw() {
    const ctx = document.getElementById("whisps-canvas").getContext("2d");
    const w = getWidth();
    const h = getHeight();

    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, w, h); // clear canvas

    const time = new Date();
    whispList.forEach( whisp => {
        ctx.globalCompositeOperation = 'screen';
        ctx.beginPath();
        ctx.fillStyle = getLightGradient( whisp.x, whisp.y, whisp.lightScale, whisp.lightColor, ctx );
        ctx.ellipse( whisp.x, whisp.y, 32 * whisp.lightScale, 32 * whisp.lightScale, 0, 0, 2 * Math.PI );
        ctx.fill();
        
    } )
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    ctx.fillRect(0, 0, w, h);
    window.requestAnimationFrame(draw);
}

init();