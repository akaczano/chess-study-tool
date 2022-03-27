import React from 'react';



class Square extends React.Component {    

    constructor(props) {
        super(props);
        this.state = {
            square: props.square
        };
    }    

    render () {        

        const x = this.state.square.x;
        const y = this.state.square.y;        

        let className = 'square';        

        if ((x % 2 === 0 && y % 2 === 0) || (x % 2 !== 0 && y % 2 !== 0)) {
            className += ' light';
        }
        else {
            className += ' dark';   
        }

        const image = this.state.square.getGraphic();
        
        return (
            <div 
                className={className}                
                onMouseUp={this.props.up}  
                onMouseMove={this.props.move}
                onClick={this.state.square.isEmpty() ? this.props.down: () => {}}
            >
               {
                image ? 
                <div 
                    className="piece"                                                
                    style={{ 
                        position: 'relative',  
                        backgroundImage: 'url(/'+image + ')', 
                        width: '95%', 
                        height: '95%', 
                        backgroundSize: 'contain',
                        textAlign: 'center',                        
                        left: this.props.offsetX + 'px',
                        top: this.props.offsetY + 'px',                        
                    }}                      
                    onMouseDown={this.props.down}    
                    onDragStart={e => e.preventDefault() }
                                    
                />
                 : null} 
            </div>
        );
    }

};

export default Square;