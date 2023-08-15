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

const ctx = canvasEl.getContext("2d");
const timeObj = { 
    lastDrawn: ( new Date() ).getTime() / 1000 - ( 1000 / 60 ), 
    current: ( new Date() ).getTime() / 1000, 
    delta: 1000 / 60
};
const mouseObj = { x: getWidth() / 2, y: getHeight() / 2, mousedown: false, mouseup: false, speed: 0, direction: 0 };
const handleMouseMove = ( e ) => { 
    const time = ( new Date() ).getTime() / 1000;
    const delta = time - mouseObj.timeLastMoved;
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

function init() {
    handleResize();
    window.requestAnimationFrame(draw);
    window.addEventListener( 'resize', handleResize );
    window.addEventListener( 'mousemove', handleMouseMove );
    window.addEventListener( 'mouseup', handleMouseUp );
    window.addEventListener( 'mousedown', handleMouseDown );
}

const colorHues = { 'red':0, 'orange':30, 'yellow':60, 'green':100, 'sea':150, 'cyan':180, 
    'sky':200, 'blue':240, 'indigo':260, 'purple':280, 'pink':300, 'fuschia':335, 'white':-1 };      

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
        '@' :   'spawnLoc',
        default: 'type',
    },
    whispTypeProps: {
        default: {},
        'whisp': {
            lightScale: 1,
            lightColor: '#FFFFFF',
            whispScale: 1,
            whispColor: '#FFFFFF',
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
            conditions.push( new Condition( vals, _i ) );
        } else {
            actions.push( new Action( values, _i ) );
        }
    } );
    const behavior = { actions: actions, conditions: conditions };
    return behavior;
}

function getScaleValue( segments ) {
    const args = [];
    segments.forEach( seg => {
        const pSeg = parseInt( seg );
        if( !( isNaN( pSeg ) ) ) {
            args.push( pSeg );
        }
    } );
    args.sort( ( a, b ) => a - b );
    if( args.length > 1 ) {
        return { min: args[0], max: args[1], 
            current : args[0] + ( args[1] - args[0] ) * Math.random()
        };
    } 
    if( args.length === 1 ) {
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
        l: { lowX: -spawnMargin, highX: -spawnMargin, lowY: 0, highY: getHeight()}, 
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

class Condition {
    constructor( _args, _i ) { 
        const [ subject, type, ...args ] = _args;
        this.args = [];
        this.subject = subject;
        this.type = type;
        args.forEach( arg => {
            const argInt = parseInt( arg );
            if( !( isNaN( argInt ) ) ) {
                this.args.push( ( !( this.type === 'direction' )
                        ? argInt : 2 * Math.PI * argInt / 360 ) );
            } else {
                this.args.push( arg );
            }
        } );
        if( this.type === 'direction' ) {
            this.args.forEach( arg => { arg = 2 * Math.PI * arg / 360; } );
        }
        this.whispIndex = _i; 
    }
    evaluate() {
        let reverseLogic = false;
        let [ max, min, distance, x1, y1, subjectSpeed, subjectDirection ] = [0,0,0,0,0,0,0];
        switch( this.subject ) {
            case 'nearest':
            case 'cursor': 
                switch( this.type ) {
                    case 'out':
                    case 'outside': reverseLogic = true;
                    case 'within':
                    case 'in':
                        [ x1, y1 ] = whispList[this.whispIndex].getTargetCoords( this.subject );
                        max = ( ( this.args.length === 1 ) 
                                ? this.args[0] : ( ( this.args.length > 1 ) ? this.args[1] : whispList[this.whispIndex].lightScale * 32 ));
                        min = ( ( this.args.length <= 1 ) ? 0 : this.args[0] );
                        distance = pointDistance( x1, y1, whispList[this.whispIndex].coords.x, whispList[this.whispIndex].coords.y );
                        return ( !reverseLogic ? ( distance <= max && distance >= min ) 
                                : !( distance <= max && distance >= min ) );
                    case 'speed':
                        subjectSpeed = ( whispList[this.whispIndex].getTargetVector( this.subject ) )[0];
                        max = ( ( this.args.length === 1 ) 
                                ? this.args[0] : ( ( this.args.length > 1 ) ? this.args[1] : whispList[this.whispIndex].lightScale * 32 ));
                        min = ( ( this.args.length <= 1 ) ? 0 : this.args[0] );
                        distance = pointDistance( x1, y1, whispList[this.whispIndex].coords.x, whispList[this.whispIndex].coords.y );
                        return ( subjectSpeed <= max && subjectSpeed >= min );
                    case 'direction':
                        subjectDirection = ( whispList[this.whispIndex].getTargetVector( this.subject ) )[1];
                        max = ( ( this.args.length === 1 ) ? this.args[0] 
                                : ( ( this.args.length > 1 ) ? this.args[1] : whispList[this.whispIndex].lightScale * 32 )
                        );
                        min = ( ( this.args.length <= 1 ) ? 0 : this.args[0] );
                        distance = pointDistance( x1, y1, whispList[this.whispIndex].coords.x, whispList[this.whispIndex].coords.y );
                        return ( subjectSpeed <= max && subjectSpeed >= min );
                    default: return true;
                }
            case 'area':
                switch( this.type ) {
                    case 'out':
                    case 'outside': reverseLogic = true;
                    case 'within':
                    case 'in': return true;
                    default: return true;
                }
            break;
            default: return true; 
        }
    }
}

class Action {
    constructor( _args, _i ) { 
        const [ _act, ...actArgs ] = _args; 
        this.act = _act;
        this.args = [];
        actArgs.forEach( arg => {
            const argInt = parseInt( arg );
            if( !( isNaN( argInt ) ) ) {
                this.args.push( argInt );
            } else {
                this.args.push( arg );
            }
        } );
        if( this.act === 'follow' || this.act === 'flee' )
            this.args[3] = 2 * Math.PI * this.args[3] / 360;
        this.whispIndex = _i; 
    }
    perform() {
        switch( this.act ) {
            case 'follow':
                whispList[this.whispIndex].follow( [ ...( this.args ) ] );
                break;
            case 'drift':

                break;
            case 'turn':

                break;
            case 'orbit':

                break;
            case 'flee':
                whispList[this.whispIndex].flee( [ ...( this.args ) ] );
                break;
            default: break;
        }
    }
}

class Whisp {
    constructor( whispString, i ) {
        const data = whispString.split( ' ', 20 );
        this.behaviors = [];
        
        const spawnData = []
        data.forEach( phrase => { 
            const [ phraseType, phraseName, ...args ] = phrase.split( '-', 20 );
            const propType = getPropType( phraseType );
            switch( phraseType.toUpperCase() ) {          
                case 'T': // TYPE - add default props for specified whisp type
                    Object.assign( this, whispData.whispTypeProps[ phraseName ] ); 
                    this[ propType ] = phraseName;
                    break;
                case 'B': // BEHAVIOR - add to behavior ( actions[] & conditions[] ) to behaviors[]
                    (this.behaviors).push( getBehaviorValue( [ phraseName, ...args ], i ) ); 
                    break;
                case 'WS': case 'LS': // WHISP SIZE or LIGHT SIZE - set size (x32px) of whisp or light
                    this[ propType ] = getScaleValue( [ phraseName, ...args ] );
                    break;
                case 'WC': case 'LC': // WHISP COLOR or LIGHT COLOR - set color from colorHues
                    this[ propType ] = ( colorHues.hasOwnProperty( phraseName.toLowerCase() ) 
                                ? colorHues[ phraseName.toLowerCase() ] 
                                : colorHues[ 'white' ] );
                    break;
                case '@': // SPAWN LOCATION - set which sides/ coordinate ranges where whisp can spawn
                    spawnData.push( getSpawnLocValue( [ phraseName, ...args ] ) ); 
                    break;
                default: console.log(`Whisp property '${ phraseType }' not recognized in whisp[${ i }].`);
            }
        } );
        this.spawnLoc = spawnData;
        const c = newSpawnCoords( spawnData );
        this.coords = { x: c.x, y: c.y };
        this.xspeed = 0;
        this.yspeed = 0;
        this.id = nextWhispId();
    }
    
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
    moveStep() {
        this.coords.x += this.xspeed * timeObj.delta;
        this.coords.y += this.yspeed * timeObj.delta;
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
    executeBehaviors() {
        this.behaviors.forEach( behavior => {
            const { actions, conditions } = behavior;
            let conditionsMet = true;
            conditions.forEach( _cond => { if( conditionsMet ) conditionsMet = _cond.evaluate(); } );
            if( conditionsMet ) {
                actions.forEach( _action => { _action.perform() } );
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

const whispList = [ 
    (new Whisp("T-whisp B-follow.cursor.30.15.50-if.cursor.within.1000 LS-4 LC-yellow WS-2 WC-yellow @-tblr-25-75", 0 )),
    (new Whisp("T-whisp B-follow.cursor.30.15.50-if.cursor.within.1900 LS-2 LC-cyan WS-2 WC-cyan @-rlbt-40-60", 1 )),
    (new Whisp("T-whisp B-follow.cursor.30.15.50-if.cursor.within.1900 LS-5 LC-white WS-2 WC-white @-lr-0-0 @-tb-0-100", 2 )),
    (new Whisp("T-whisp B-follow.cursor.30.15.50-if.cursor.within.1900 LS-2 LC-fuschia WS-2 WC-fuschia @-tb-0-0 @-rl-0-100", 3 )) 
];
whispList.forEach( whispy => { 
    whispy.x = 40 + Math.random() * ( getWidth() - 80 ); 
    whispy.y = 40 + Math.random() * ( getHeight() - 80 ); 
} );

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
    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    ctx.fillRect( 0, 0, w, h );

    prevMouseCoords = [ mouseObj.x, mouseObj.y ];
    window.requestAnimationFrame(draw);
}

init();