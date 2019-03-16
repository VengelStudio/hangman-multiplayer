import React, { Component } from 'react'
import './Cards.css'

const CardContent = ({ id, description, cardBehaviour }) => {
    let {
        isMine,
        isUsed,
        isDisabled,
        isBlocked,
        isDiscardEnabled
    } = cardBehaviour
    let classes = 'card-image '
    if (isUsed || isDisabled || isBlocked || isDiscardEnabled)
        classes += 'card-image-used '

    if (isMine) {
        let descriptionComponent = isUsed ? (
            <div className='card-info'>{description}</div>
        ) : null
        return (
            <React.Fragment>
                <img
                    className={classes}
                    src={`images/cards/${id}.svg`}
                    alt='Playing card.'
                />
                {descriptionComponent}
            </React.Fragment>
        )
    } else {
        return (
            <img
                className={`${classes} default-pointer`}
                src={`images/cards/placeholder.svg`}
                alt='Playing card.'
            />
        )
    }
}

const CardOverlay = ({ cardBehaviour, onUseAbort, onDiscard, onUse }) => {
    let { isUsed, isDisabled, isBlocked, isDiscardEnabled } = cardBehaviour
    let overlay = null
    if (isDiscardEnabled) {
        overlay = (
            <button
                className='card-discard-button'
                onClick={() => {
                    onDiscard()
                }}
            >
                <div>Click to discard</div>
            </button>
        )
    } else if (isUsed) {
        overlay = (
            <button
                className='card-use-abort-button'
                onClick={() => {
                    onUseAbort()
                }}
            >
                <div>Click to abort</div>
            </button>
        )
    } else if (isDisabled) {
        overlay = (
            <div className='card-disabled-info'>
                This card doesn't meet the conditions. Check the description.
            </div>
        )
    } else if (isBlocked) {
        overlay = (
            <div className='card-disabled-info'>This card is disabled.</div>
        )
    } else {
        overlay = <button className='card-use-button' onClick={onUse} />
    }
    return <div className='card-overlay'>{overlay}</div>
}

class Card extends Component {
    render() {
        let {
            cardBehaviour,
            card,
            onUseAbort,
            onDiscard,
            onUse,
            isMine
        } = this.props
        let classes = 'card '
        if (isMine) classes += 'hover-pointer'

        return (
            <div className={classes}>
                <CardContent
                    id={card.id}
                    description={card.description}
                    cardBehaviour={cardBehaviour}
                />
                <CardOverlay
                    cardBehaviour={cardBehaviour}
                    onUse={onUse}
                    onUseAbort={onUseAbort}
                    onDiscard={onDiscard}
                />
            </div>
        )
    }
}

export default Card