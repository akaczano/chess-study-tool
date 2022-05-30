import { useState } from 'react'

function IconButton(props) {
    const [hover, setHover] = useState(false)
    const { color, disabledColor, hoverColor, disabled, onClick, style } = props

    const mouseEnter = () => {
        if (!disabled) {
            setHover(true)
        }
    }

    const mouseLeave = () => {
        setHover(false)
    }
    const actualColor = disabled ? disabledColor : (hover ? hoverColor : color)
    const handler = disabled ? () => {} : onClick
    return (
        <span
            onMouseEnter={mouseEnter}
            onMouseLeave={mouseLeave} 
            onClick={handler}
            style={{...style, color: actualColor, cursor: 'pointer'}}
        >
            {props.children}
        </span>
    )
}

export default IconButton