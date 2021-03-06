import React from 'react';
import ExpandableEditor from '../../../Common/Layout/ExpandableEditor/Editor';
import ForeignKeySelector from '../Common/ReusableComponents/ForeignKeySelector';
import { getForeignKeyConfig } from '../Common/ReusableComponents/utils';
import { setForeignKeys, toggleFk, clearFkToggle } from './AddActions';

import styles from '../../../Common/TableCommon/Table.scss';

const ForeignKeyWrapper = ({
  foreignKeys,
  allSchemas,
  columns,
  dispatch,
  fkToggled,
}) => {
  // columns in the right order with their indices
  const orderedColumns = columns
    .filter(c => Boolean(c.name))
    .map((c, i) => ({
      name: c.name,
      type: c.type,
      index: i,
    }));

  // Generate a list of reference tables and their columns
  const refTables = {};
  allSchemas.forEach(tableSchema => {
    refTables[tableSchema.table_name] = tableSchema.columns.map(
      c => c.column_name
    );
  });

  const numFks = foreignKeys.length;

  // TODO check out match full

  // Map the foreign keys in the fkModify state and render
  return foreignKeys.map((fk, i) => {
    const fkConfig = getForeignKeyConfig(fk, orderedColumns);
    const isLast = i + 1 === numFks;

    // The content when the editor is expanded
    const expandedContent = () => (
      <ForeignKeySelector
        refTables={refTables}
        foreignKey={fk}
        index={i}
        service="add-table"
        foreignKeys={foreignKeys}
        orderedColumns={orderedColumns}
        dispatch={dispatch}
        setForeignKeys={setForeignKeys}
      />
    );
    // TODO handle ongoing request

    // Function to remove FK (is undefined for the last FK)
    let removeFk;
    if (!isLast) {
      removeFk = () => {
        const newFks = [
          ...foreignKeys.slice(0, i),
          ...foreignKeys.slice(i + 1),
        ];
        dispatch(setForeignKeys(newFks));
        dispatch(clearFkToggle());
      };
    }

    // Label to show next to the 'Edit' button (the FK configuration)
    let collapsedLabelText;
    if (fkConfig) {
      collapsedLabelText = (
        <b>{fkConfig}</b>
      );
    } else if (isLast && numFks === 1) {
      collapsedLabelText = (
        <i>(You can add foreign keys later as well)</i>
      );
    }

    const collapsedLabel = () => (
      <div>
        <div className="container-fluid">
          <div className="row">
            <h5 className={styles.padd_bottom}>
              {collapsedLabelText}
              &nbsp;
            </h5>
          </div>
        </div>
      </div>
    );

    const expandedLabel = () => {
      return (
        <h5 className={styles.padd_bottom}>
          <b>{fkConfig}</b>
        </h5>
      );
    };

    // The collapse button text when the editor is collapsed
    let expandButtonText = isLast ? 'Add another foreign key' : 'Edit';
    if (numFks === 1) expandButtonText = 'Add a foreign key';

    let saveCallback;
    if (fkConfig) {
      saveCallback = () => {
        dispatch(clearFkToggle());
      };
    }

    const expandCallback = () => {
      dispatch(toggleFk(i));
    };

    const collapseCallback = fkConfig ? saveCallback : removeFk;

    // Wrap the collapsed and expanded content in the reusable editor
    return (
      <div key={`${i}`}>
        <ExpandableEditor
          editorExpanded={expandedContent}
          expandedLabel={expandedLabel}
          collapsedLabel={collapsedLabel}
          property={`fk-${i}`}
          service="add-table"
          removeFunc={removeFk}
          saveFunc={saveCallback}
          expandButtonText={expandButtonText}
          isCollapsable
          expandCallback={expandCallback}
          collapseCallback={collapseCallback}
          toggled={fkToggled === i}
        />
      </div>
    );
  });
};

export default ForeignKeyWrapper;
