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

const mouseObj = { x: getWidth()/2, y: getHeight()/2, mousedown: false, mouseup: false, speed:0 }
const handleMouseMove = ( e ) => { 
    const time = ( new Date() ).getTime() / 1000;
    const delta = time - mouseObj.timeLastMoved;
    mouseObj.xSpeed = ( e.clientX - mouseObj.x ) / delta; 
    mouseObj.ySpeed = ( e.clientY - mouseObj.y ) / delta;
    mouseObj.x = e.clientX; 
    mouseObj.y = e.clientY; 
    mouseObj.timeLastMoved = time;
    mouseObj.moved = true;
};
const handleMouseUp = ( e ) => { mouseObj.mouseup = true; };
const handleMouseDown = ( e ) => { mouseObj.mousedown = true; };

const spawnMargin = 24; // how far off-screen to spawn whisps
let nextWhispId = 0;

function init() {
    handleResize();
    window.requestAnimationFrame(draw);
    window.addEventListener( 'resize', handleResize );
    window.addEventListener( 'mousemove', handleMouseMove );
    window.addEventListener( 'mouseup', handleMouseUp );
    window.addEventListener( 'mousedown', handleMouseDown );
}

const colorHues = { 'red':0, 'orange':30, 'yellow':60, 'green':100, 'sea':150, 'cyan':180, 
    'sky':200, 'blue':240, 'indigo':260, 'purple':280, 'pink':300, 'fuschia':335 };

const timeObj = { lastDrawn: ( new Date() ).getTime() / 1000, current: ( new Date() ).getTime() / 1000 }

// whispString: a sequence of space-separated phrases describing 
//      the desired appearance/behavior of the whisp.
//          Each phrase is in the following format:
//  whispString:     '{ propType }-{ propName }-{ (arg1?) }-{ (argN?) }'
//  behaviorString:  "B-{ action }-{ stimulus }-{ condition }"
//      actionString:    "{ actionType }.{ arg1 }.{ arg2 }.{ arg3 }"     (separated by '.' or ',')
//      conditionString: "{ conditionType }.{ arg1 }.{ arg2 }.{ arg3 }"  (separated by '.' or ',')
//      stimulusString:  "{ stimulusType }"
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
function getStimulusValue( stimulusString ) {

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
                result = { 
                    x: rand - min + s.lowX , 
                    y: ( s.side === 't' ? -spawnMargin : getHeight() + spawnMargin ) 
                }; 
            }
            else if( s.side === 'l' || s.side === 'r' ) { 
                result = { 
                    x: ( s.side === 'l' ? -spawnMargin : getWidth() + spawnMargin ), 
                    y: rand - min + s.lowY 
                }; 
            }
        }
        min += w;
    } );
    return result;
}

const pointDistance = ( x1, y1, x2, y2 ) => Math.sqrt( Math.pow( x1 - x2, 2 ) + Math.pow( y1 - y2, 2 ) );
const pointDirection = ( x1, y1, x2, y2 ) => ( Math.atan2( y1 - y2, x1 - x2) + 2 * Math.PI ) % ( 2 * Math.PI );
const pointVector = ( x1, y1, x2, y2 ) => [ pointDistance( x1, y1, x2, y2 ), pointDirection( x1, y1, x2, y2 ) ];
const turnAmount = ( _dir1, _dir2 ) => {
    const array = [ _dir1 - _dir2, _dir1 + 2 * Math.PI - _dir2, _dir1 - 2 * Math.PI - _dir2 ];
    let best = 2 * Math.PI;
    array.forEach( dDir => { if( Math.abs( dDir ) < Math.abs( best ) ) best = dDir; } );
    return best;
}

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
        this.xspeed = 0;
        this.yspeed = 0;
        this.id = nextWhispId;
        nextWhispId += 1;
        console.log(this)
        }

    evaluateCondition( condition, ctx ) {
        const { subject, type, args } = condition;
        let [ maxDistance, minDistance, distance, x1, y1 ] = [0,0,0,0,0];
        let reverseLogic = false;
        switch( subject ) {
            case 'cursor': 
                switch( type ) {
                    case 'outside': reverseLogic = true;
                    case 'within':
                        [ x1, y1 ] = [ mouseObj.x, mouseObj.y ];
                        maxDistance = ( ( args.length === 1 ) 
                                ? args[0] : ( ( args.length > 1 ) ? args[1] : this.lightScale * 32 ));
                        minDistance = ( ( args.length <= 1 ) ? 0 : args[0] );
                        distance = pointDistance( x1, y1, this.x, this.y );
                        return ( !reverseLogic ? ( distance <= maxDistance && distance >= minDistance ) 
                                : !( distance <= maxDistance && distance >= minDistance ) );
                    case 'speed':

                        return true;
                    default: return true;
                }
            case 'area':
                switch( type ) {
                    case 'outside': reverseLogic = true;
                    case 'in': 
                        return true;
                    default: return true;
                }
            break;
            default: return; 
        }
    }
    getNearestWhispCoords() {
        let nearest = 9999999;
        let nearestCoords = false;
        whispList.forEach( _whisp => {
            if( !( _whisp.id === this.id ) ) {
                const dist = pointDistance( this.x, this.y, _whisp.x, _whisp.y );
                if( nearest > dist ) {
                    nearest = dist;
                    nearestCoords = [ _whisp.x, _whisp.y ];
                }
            }
        } );
        return nearestCoords;
    }
    getTargetCoords( target ) {
        switch( target ) {
            default:
            case 'cursor': return [ mouseObj.x, mouseObj.y ];
            case 'nearest': return this.getNearestWhispCoords();
        }
    }
    moveStep() {
        this.x += this.xspeed; 
        this.y += this.yspeed;
    }
    getDirection() { return pointDirection( 0, 0, this.yspeed, this.xspeed ); }
    getSpeed() { return pointDistance( 0, 0, this.xspeed, this.yspeed ); }
    getVector() { 
        return [
            this.getSpeed(),
            this.getDirection()
        ]; 
    }
    getSpeedXY( [ _speed, _dir ] ) {
        return [ _speed * Math.cos( _dir ), _speed * Math.sin( _dir ) ];
    }
    turn( turnAngle ) {
        const [ _speed, _dir ] = this.getVector();
        [ this.xspeed, this.yspeed ] = this.getSpeedXY( [ _speed, _dir + turnAngle ] )
    }
    turnTowardDirection( targetDirection, turnAngle ) {
        const maxAngle = turnAmount( this.getDirection(), targetDirection );
        this.turn(( Math.abs( turnAngle ) > Math.abs( maxAngle ) ? maxAngle : Math.sign( maxAngle ) * turnAngle ) );
    }
    turnTowardPoint( _x, _y, turnAngle ) {
        const maxAngle = turnAmount( this.getDirection(), pointDirection( this.x, this.y, _x, _y ) );
        this.turn( ( Math.abs( turnAngle ) > Math.abs( maxAngle ) ? maxAngle : Math.sign( maxAngle ) * turnAngle ) );
    }
    turnAwayFromPoint( _x, _y, turnAngle ) {
        const maxAngle = turnAmount( this.getDirection(), pointDirection( _x, _y, this.x, this.y ) );
        this.turn( ( Math.abs( turnAngle ) > Math.abs( maxAngle ) ? maxAngle : Math.sign( maxAngle ) * turnAngle ) );
    }
    slowDown( _amount, _minSpeed ) {
        const [ _speed, _dir ] = this.getVector();
        const dSpeed = ( _speed - _amount >= _minSpeed ? _amount : _speed - _minSpeed );
        [ this.xspeed, this.yspeed ] = this.getSpeedXY( [ _speed - dSpeed, _dir ] );
    }
    speedUp( _amount, _maxSpeed ) {
        const [ _speed, _dir ] = this.getVector();
        const dSpeed = ( _speed + _amount <= _maxSpeed ? _amount : _maxSpeed - _speed );
        [ this.xspeed, this.yspeed ] = this.getSpeedXY( [ _speed + dSpeed, _dir ] );
    }

    /* behavior: { 
            action: { act:(String), args:[...] },
            condition: { subject:(String), type:(String), args:[...] },
            stimulus: { subject:(String), type:(String), args:[...] } 
        }
    */
    /*
    BEHAVIORS:
    'follow.{whatToFollow?}.{speed?}.{...followModifiers}'
    'turn.{away/toward}
    'flee.{runFromWhat?}.{speed?}.{...runAwayModifiers}'
    'orbit.{whatToOrbit?}.{orbitSpeed?}.{orbitRadius?}'
    'drift.{minSpeed?}.{maxSpeed?}.{driftDirection?}'
    'explore.{exploreLowSpeed?}.{exploreHighSpeed}'
    'wiggle.{minAmplitude}.{maxAmplitude}.{minFreq}.{maxFreq}'
    */
    //      conditionString: "{ conditionType }.{ arg1 }.{ arg2 }.{ arg3 }"
    // "B-follow.cursor.fast-on.click.#button1-if.cursor.within.100
    // condition: { subject, type, args[]}
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

    performAction( action, ctx ) {
        const { act, args } = action;

        switch( act ) {
            case 'follow':
                this.follow( args );
                break;
            case 'drift':

                break;
            case 'turn':

                break;
            case 'orbit':

                break;
            case 'flee':
                this.flee( args );
                break;
            default: break;
        }
    }
    executeBehaviors( time, ctx ) {
        this.behaviors.forEach( behavior => {
            const { actions, stimuli, conditions } = behavior;
            let conditionsMet = true;
            conditions.forEach( cond => { if( conditionsMet ) conditionsMet = this.evaluateCondition( cond, ctx ); } );
            if( conditionsMet ) {
                actions.forEach( _action => { this.performAction( _action ) } );
            }
        } );
    }
}

const whispList = [ new Whisp("T-whisp LS-4 LC-yellow WS-2 WC-yellow @-tblr-25-75" ),
                    new Whisp("T-whisp LS-2 LC-cyan WS-2 WC-cyan @-rlbt-40-60" ),
                    new Whisp("T-whisp LS-5 LC-white WS-2 WC-white @-lr-0-0 @-tb-0-100" ),
                    new Whisp("T-whisp LS-2 LC-fuschia WS-2 WC-fuschia @-tb-0-0 @-rl-0-100" )
                ];
whispList.forEach( whispy => { 
    whispy.x = 40 + Math.random()*(getWidth()-80); 
    whispy.y = 40 + Math.random()*(getHeight()-80); 
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

    timeObj.lastDrawn = timeObj.current;
    timeObj.current = ( new Date() ).getTime() / 1000;
    const delta = timeObj.current - timeObj.lastDrawn;
    
    whispList.forEach( whisp => {
        ctx.globalCompositeOperation = 'screen';
        ctx.beginPath();
        ctx.fillStyle = getLightGradient( whisp.x, whisp.y, whisp.lightScale, whisp.lightColor, ctx );
        ctx.ellipse( whisp.x, whisp.y, 32 * whisp.lightScale, 32 * whisp.lightScale, 0, 0, 2 * Math.PI );
        ctx.fill();
    } );
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    ctx.fillRect(0, 0, w, h);

    window.requestAnimationFrame(draw);
}

init();