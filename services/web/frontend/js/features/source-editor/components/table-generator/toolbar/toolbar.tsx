import { memo, useMemo } from 'react'
import { useSelectionContext } from '../contexts/selection-context'
import { ToolbarButton } from './toolbar-button'
import { ToolbarButtonMenu } from './toolbar-button-menu'
import { ToolbarDropdown, ToolbarDropdownItem } from './toolbar-dropdown'
import MaterialIcon from '../../../../../shared/components/material-icon'
import {
  BorderTheme,
  insertColumn,
  insertRow,
  mergeCells,
  moveCaption,
  removeCaption,
  removeNodes,
  removeRowOrColumns,
  setAlignment,
  setBorders,
  unmergeCells,
} from './commands'
import { useCodeMirrorViewContext } from '../../codemirror-editor'
import { useTableContext } from '../contexts/table-context'
import { useTabularContext } from '../contexts/tabular-context'
import SplitTestBadge from '../../../../../shared/components/split-test-badge'

const borderThemeLabel = (theme: BorderTheme | null) => {
  switch (theme) {
    case BorderTheme.FULLY_BORDERED:
      return 'All borders'
    case BorderTheme.NO_BORDERS:
      return 'No borders'
    default:
      return 'Custom borders'
  }
}

export const Toolbar = memo(function Toolbar() {
  const { selection, setSelection } = useSelectionContext()
  const view = useCodeMirrorViewContext()
  const { positions, rowSeparators, cellSeparators, tableEnvironment, table } =
    useTableContext()
  const { showHelp } = useTabularContext()

  const borderDropdownLabel = useMemo(
    () => borderThemeLabel(table.getBorderTheme()),
    [table]
  )

  const captionLabel = useMemo(() => {
    if (!tableEnvironment?.caption) {
      return 'No caption'
    }
    if (tableEnvironment.caption.from < positions.tabular.from) {
      return 'Caption above'
    }
    return 'Caption below'
  }, [tableEnvironment, positions.tabular.from])

  if (!selection) {
    return null
  }
  const columnsToInsert = selection.maximumCellWidth(table)
  const rowsToInsert = selection.height()

  return (
    <div className="table-generator-floating-toolbar">
      <div className="table-generator-button-group">
        <ToolbarDropdown
          id="table-generator-caption-dropdown"
          label={captionLabel}
          disabled={!tableEnvironment}
        >
          <ToolbarDropdownItem
            id="table-generator-caption-none"
            command={() => {
              removeCaption(view, tableEnvironment)
            }}
          >
            No caption
          </ToolbarDropdownItem>
          <ToolbarDropdownItem
            id="table-generator-caption-above"
            command={() => {
              moveCaption(view, positions, 'above', tableEnvironment)
            }}
          >
            Caption above
          </ToolbarDropdownItem>
          <ToolbarDropdownItem
            id="table-generator-caption-below"
            command={() => {
              moveCaption(view, positions, 'below', tableEnvironment)
            }}
          >
            Caption below
          </ToolbarDropdownItem>
        </ToolbarDropdown>
        <ToolbarDropdown
          id="table-generator-borders-dropdown"
          label={borderDropdownLabel}
        >
          <ToolbarDropdownItem
            id="table-generator-borders-fully-bordered"
            command={() => {
              setBorders(
                view,
                BorderTheme.FULLY_BORDERED,
                positions,
                rowSeparators,
                table
              )
            }}
          >
            <MaterialIcon type="border_all" />
            <span className="table-generator-button-label">All borders</span>
          </ToolbarDropdownItem>
          <ToolbarDropdownItem
            id="table-generator-borders-no-borders"
            command={() => {
              setBorders(
                view,
                BorderTheme.NO_BORDERS,
                positions,
                rowSeparators,
                table
              )
            }}
          >
            <MaterialIcon type="border_clear" />
            <span className="table-generator-button-label">No borders</span>
          </ToolbarDropdownItem>
          <div className="table-generator-border-options-coming-soon">
            <div className="info-icon">
              <MaterialIcon type="info" />
            </div>
            More options for border settings coming soon.
          </div>
        </ToolbarDropdown>
      </div>
      <div className="table-generator-button-group">
        <ToolbarButtonMenu
          label="Alignment"
          icon="format_align_left"
          id="table-generator-align-dropdown"
          disabledLabel="Select a column or a merged cell to align"
          disabled={
            !selection.isColumnSelected(selection.from.cell, table) &&
            !selection.isMergedCellSelected(table)
          }
        >
          <ToolbarButton
            icon="format_align_left"
            id="table-generator-align-left"
            label="Left"
            command={() => {
              setAlignment(view, selection, 'left', positions, table)
            }}
          />
          <ToolbarButton
            icon="format_align_center"
            id="table-generator-align-center"
            label="Center"
            command={() => {
              setAlignment(view, selection, 'center', positions, table)
            }}
          />
          <ToolbarButton
            icon="format_align_right"
            id="table-generator-align-right"
            label="Right"
            command={() => {
              setAlignment(view, selection, 'right', positions, table)
            }}
          />
        </ToolbarButtonMenu>
        <ToolbarButton
          icon="cell_merge"
          id="table-generator-merge-cells"
          label={
            selection.isMergedCellSelected(table)
              ? 'Unmerge cells'
              : 'Merge cells'
          }
          active={selection.isMergedCellSelected(table)}
          disabled={
            !selection.isMergedCellSelected(table) &&
            !selection.isMergeableCells(table)
          }
          disabledLabel="Select cells in a row to merge"
          command={() => {
            if (selection.isMergedCellSelected(table)) {
              unmergeCells(view, selection, table)
            } else {
              mergeCells(view, selection, table)
            }
          }}
        />
        <ToolbarButton
          icon="delete"
          id="table-generator-remove-column-row"
          label="Delete row or column"
          disabledLabel="Select a row or a column to delete"
          disabled={
            (!selection.isAnyRowSelected(table) &&
              !selection.isAnyColumnSelected(table)) ||
            !selection.eq(selection.explode(table))
          }
          command={() =>
            setSelection(
              removeRowOrColumns(
                view,
                selection,
                positions,
                cellSeparators,
                table
              )
            )
          }
        />
        <ToolbarDropdown
          id="table-generator-add-dropdown"
          btnClassName="table-generator-toolbar-button"
          icon="add"
          tooltip="Insert"
          disabled={!selection}
        >
          <ToolbarDropdownItem
            id="table-generator-insert-column-left"
            command={() => {
              setSelection(
                insertColumn(view, selection, positions, false, table)
              )
            }}
          >
            <span className="table-generator-button-label">
              {columnsToInsert === 1
                ? 'Insert column left'
                : `Insert ${columnsToInsert} columns left`}
            </span>
          </ToolbarDropdownItem>
          <ToolbarDropdownItem
            id="table-generator-insert-column-right"
            command={() => {
              setSelection(
                insertColumn(view, selection, positions, true, table)
              )
            }}
          >
            <span className="table-generator-button-label">
              {columnsToInsert === 1
                ? 'Insert column right'
                : `Insert ${columnsToInsert} columns right`}
            </span>
          </ToolbarDropdownItem>
          <hr />
          <ToolbarDropdownItem
            id="table-generator-insert-row-above"
            command={() => {
              setSelection(
                insertRow(
                  view,
                  selection,
                  positions,
                  false,
                  rowSeparators,
                  table
                )
              )
            }}
          >
            <span className="table-generator-button-label">
              {rowsToInsert === 1
                ? 'Insert row above'
                : `Insert ${rowsToInsert} rows above`}
            </span>
          </ToolbarDropdownItem>
          <ToolbarDropdownItem
            id="table-generator-insert-row-below"
            command={() => {
              setSelection(
                insertRow(
                  view,
                  selection,
                  positions,
                  true,
                  rowSeparators,
                  table
                )
              )
            }}
          >
            <span className="table-generator-button-label">
              {rowsToInsert === 1
                ? 'Insert row below'
                : `Insert ${rowsToInsert} rows below`}
            </span>
          </ToolbarDropdownItem>
        </ToolbarDropdown>
      </div>
      <div className="table-generator-button-group">
        <ToolbarButton
          icon="delete_forever"
          id="table-generator-remove-table"
          label="Delete table"
          command={() => {
            removeNodes(view, tableEnvironment?.table ?? positions.tabular)
            view.focus()
          }}
        />
        <ToolbarButton
          icon="help"
          id="table-generator-show-help"
          label="Help"
          command={showHelp}
        />
        <div className="toolbar-beta-badge">
          <SplitTestBadge
            displayOnVariants={['enabled']}
            splitTestName="table-generator"
          />
        </div>
      </div>
    </div>
  )
})
