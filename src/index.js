// @flow

import * as React from 'react'
import PropTypes from 'prop-types'

export type Variant = 'popover' | 'popper'

export type InjectedProps = {
  open: (eventOrAnchorEl: Event | HTMLElement) => void,
  close: () => void,
  toggle: (eventOrAnchorEl: Event | HTMLElement) => void,
  setOpen: (open: boolean, eventOrAnchorEl: Event | HTMLElement) => void,
  isOpen: boolean,
  anchorEl: ?HTMLElement,
  popupId: ?string,
  variant: Variant,
}

/**
 * Creates props for a component that opens the popup when clicked.
 *
 * @param {object} popupState the argument passed to the child function of
 * `PopupState`
 */
export function bindTrigger({ isOpen, open, popupId, variant }: InjectedProps): {
  'aria-owns'?: ?string,
  'aria-describedby'?: ?string,
  'aria-haspopup': true,
  onClick: (event: Event) => void,
} {
  return {
    [variant === 'popover' ? 'aria-owns' : 'aria-describedby']: isOpen ? popupId : null,
    'aria-haspopup': true,
    onClick: open,
  }
}

/**
 * Creates props for a component that toggles the popup when clicked.
 *
 * @param {object} popupState the argument passed to the child function of
 * `PopupState`
 */
export function bindToggle({ isOpen, toggle, popupId, variant }: InjectedProps): {
  'aria-owns'?: ?string,
  'aria-describedby'?: ?string,
  'aria-haspopup': true,
  onClick: (event: Event) => void,
} {
  return {
    [variant === 'popover' ? 'aria-owns' : 'aria-describedby']: isOpen ? popupId : null,
    'aria-haspopup': true,
    onClick: toggle,
  }
}

/**
 * Creates props for a component that opens the popup while hovered.
 *
 * @param {object} popupState the argument passed to the child function of
 * `PopupState`
 */
export function bindHover({ isOpen, open, close, popupId, variant }: InjectedProps): {
  'aria-owns'?: ?string,
  'aria-describedby'?: ?string,
  'aria-haspopup': true,
  onMouseEnter: (event: Event) => any,
  onMouseLeave: (event: Event) => any,
} {
  return {
    [variant === 'popover' ? 'aria-owns' : 'aria-describedby']: isOpen ? popupId : null,
    'aria-haspopup': true,
    onMouseEnter: open,
    onMouseLeave: close,
  }
}

/**
 * Creates props for a `Popover` component.
 *
 * @param {object} popupState the argument passed to the child function of
 * `PopupState`
 */
export function bindPopover({ isOpen, anchorEl, close, popupId }: InjectedProps): {
  id: ?string,
  anchorEl: ?HTMLElement,
  open: boolean,
  onClose: () => void,
} {
  return {
    id: popupId,
    anchorEl,
    open: isOpen,
    onClose: close,
  }
}

/**
 * Creates props for a `Menu` component.
 *
 * @param {object} popupState the argument passed to the child function of
 * `PopupState`
 */
export const bindMenu = bindPopover

/**
 * Creates props for a `Popper` component.
 *
 * @param {object} popupState the argument passed to the child function of
 * `PopupState`
 */
export function bindPopper({ isOpen, anchorEl, popupId }: InjectedProps): {
  id: ?string,
  anchorEl: ?HTMLElement,
  open: boolean,
} {
  return {
    id: popupId,
    anchorEl,
    open: isOpen,
  }
}

export type Props = {
  popupId?: string,
  children: (props: InjectedProps) => ?React.Node,
  variant: Variant,
}

type State = {
  anchorEl: ?HTMLElement,
}

let eventOrAnchorElWarned: boolean = false

export default class PopupState extends React.Component<Props, State> {
  state: State = { anchorEl: null };

  static propTypes = {
    /**
     * The render function.
     *
     * @param {object} props the properties injected by `PopupState`:
     * <ul>
     *   <li>`open(eventOrAnchorEl)`: opens the popup</li>
     *   <li>`close()`: closes the popup</li>
     *   <li>`toggle(eventOrAnchorEl)`: opens the popup if it is closed, or
     *     closes the popup if it is open.
     *   </li>
     *   <li>`setOpen(open, [eventOrAnchorEl])`: sets whether the popup is open.
     *     `eventOrAnchorEl` is required if `open` is truthy.
     *   </li>
     *   <li>`isOpen`: `true`/`false` if the popup is open/closed</li>
     *   <li>`anchorEl`: the current anchor element (`null` the popup is closed)</li>
     *   <li>`popupId`: the `popupId` prop you passed</li>
     * </ul>
     *
     * @returns {React.Node} the content to display
     */
    children: PropTypes.func.isRequired,
    /**
     * The `id` property to use for the popup.  Will be passed to the render
     * function as `bindPopup.id`, and also used for the `aria-owns` property
     * passed to the trigger component via `bindTrigger`.
     */
    popupId: PropTypes.string,
    /**
     * Which type of popup you are controlling.  Use `'popover'` for `Popover`
     * and `Menu`; use `'popper'` for `Popper`s.  Right now this only affects
     * whether `aria-owns` or `aria-describedby` is used on the trigger
     * component.
     */
    variant: PropTypes.oneOf(['popover', 'popper']).isRequired,
  }

  handleToggle = (eventOrAnchorEl: Event | HTMLElement) => {
    if (this.state.anchorEl) this.handleClose()
    else this.handleOpen(eventOrAnchorEl)
  }

  handleOpen = (eventOrAnchorEl: Event | HTMLElement) => {
    if (!eventOrAnchorElWarned && !eventOrAnchorEl && !eventOrAnchorEl.target) {
      eventOrAnchorElWarned = true
      console.error('eventOrAnchorEl should be defined') // eslint-disable-line no-console
    }
    this.setState({
      anchorEl: eventOrAnchorEl && eventOrAnchorEl.target
        ? (eventOrAnchorEl.target: any)
        : (eventOrAnchorEl: any),
    })
  }

  handleClose = () => this.setState({ anchorEl: null });

  handleSetOpen = (open: boolean, eventOrAnchorEl: Event | HTMLElement) => {
    if (open) this.handleOpen(eventOrAnchorEl)
    else this.handleClose()
  }

  render(): ?React.Node {
    const { children, popupId, variant } = this.props
    const { anchorEl } = this.state

    const isOpen = Boolean(anchorEl)

    return children({
      open: this.handleOpen,
      close: this.handleClose,
      toggle: this.handleToggle,
      setOpen: this.handleSetOpen,
      isOpen,
      anchorEl,
      popupId,
      variant,
    })
  }
}
