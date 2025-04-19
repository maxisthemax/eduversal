// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

//*material
import { colors } from '@mui/material'
import Chip, { ChipProps } from '@mui/material/Chip'

interface ChipColorProps {
  chipColor?: string
  color?: string
  colorIndex?: number
  textColor?: string
  label: string | React.ReactNode
  selected?: boolean
  type?: string
}

/**
 * `ChipColor` is a Material-UI Chip component with customized color options.
 * It allows setting the chip's background color and text color.
 *
 * @params
 * @param chipColor - The color of the chip from Material-UI's color palette.
 * @param color - The built-in color for the chip. This takes precedence over the `chipColor` prop.
 * @param colorIndex - The shade index from the Material-UI color palette. It only applies when the `chipColor` prop is used.
 * @param textColor - The color of the text within the chip.
 * @param label - The content of the chip.
 * @param ...rest - Rest of the props that can be passed to a Material-UI Chip component.
 *
 * @component
 * @example
 * <ChipColor chipColor="red" colorIndex={300} textColor="black" label="My Label" />
 */

function ChipColor({
  chipColor = '',
  color = 'secondary',
  colorIndex = 600,
  textColor = 'white',
  label,
  selected = false,
  type = '',
  ...rest
}: ChipColorProps & ChipProps) {
  const reg = /^#([0-9a-f]{3}){1,2}([0-9a-f]{2})?$/i

  if (type === 'selection')
    return (
      <Chip
        size="small"
        style={{
          color: selected ? 'inherit' : '#7F7A7A',
          minWidth: '80px',
        }}
        color={selected ? 'secondary' : 'default'}
        label={label}
        {...rest}
      />
    )
  else
    return (
      <Chip
        size="small"
        style={{
          ...(chipColor
            ? {
                backgroundColor: chipColor
                  ? reg.test(chipColor)
                    ? chipColor
                    : colors[chipColor][colorIndex]
                  : 'inherit',
              }
            : {}),
          color: textColor,
        }}
        color={color}
        label={label}
        {...rest}
      />
    )
}

export default ChipColor
