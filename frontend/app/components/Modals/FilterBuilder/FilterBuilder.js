import React, { Component } from 'react';
import Select from 'react-select';

import filterOperators from './filterOperators'
import { filterBuilderReceiveRules, filterBuilderChangeAll } from '../../../actions/filterBuilder';

import filterUtils from '../../../utils/filterUtils';

/**
 * @template {T}
 * @param {Object.<string, T>} o
 * @returns {{key: string, val: T}|null}
 */
function getOnlyProperty(o) {
    var property;
    var hasMore = _.some(o, (val, key) => {
        if (property) {
            property = null;
            return true;
        }
        property = {
            key: key,
            val: val
        };
        return false;
    });
    if (!hasMore && property) {
        return property;
    } else {
        return null;
    }
}

function makeKeyMaker() {

    function next(arr) {
        const index = arr.length - 1;
        arr[index]++;
    }

    function makeSubKey(prevArr) {
        var arr = prevArr.concat(-1);
        function retNext() {
            next(arr);
            return arr.slice();
        }
        retNext.makeSubKeyMaker = function() {
            return makeSubKey(arr);
        };
        return retNext;
    }

    return makeSubKey([]);
}


const filterParser = {
    ops: {
        genomicsRuleOperatorsLabels: {
            "equal": "equal",
            "not_equal": "not equal",
            "in": "in",
            "not_in": "not in",
            "less": "less",
            "less_or_equal": "less or equal",
            "greater": "greater",
            "greater_or_equal": "greater or equal",
            "between": "between",
            "not_between": "not between",
            "begins_with": "begins with",
            "not_begins_with": "doesn't begin with",
            "contains": "contains",
            "not_contains": "doesn't contain",
            "ends_with": "ends with",
            "not_ends_with": "doesn't end with",
            "is_empty": "is empty",
            "is_not_empty": "is not empty",
            "is_null": "is null",
            "is_not_null": "is not null"
        },
        genomicsRulesOperatorsList: filterOperators,
        getOperatorWantedParams: function(operatorInfo) {
            if (!operatorInfo.nb_inputs) {
                return {noParams: true};
            }
            if (operatorInfo.nb_inputs <= 1 && !operatorInfo.multiple) {
                return {single: true};
            }
            if (operatorInfo.multiple) {
                return {arrayDynamic: true};
            } else {
                return {arraySize: operatorInfo.nb_inputs};
            }
        }
    }
};

const fieldUtils = {
    getDefault(fields) {
        return fields[Object.keys(fields)[0]].id;
    },
    getFieldJSType(field) {
        const fieldType = field.type;
        const jsType = {
            'char': 'string',
            'string': 'string',
            'integer': 'number',
            'float': 'number',
            'double': 'number',
            'boolean': 'boolean'
        }[fieldType];
        return jsType;
    }
};















/**

FilterQueryBuilder(
     fields: {}
     rules: {{ <'$and'|'$or'>: ({id, label, type}|rules)[] }}
     rules1: {{condition: <'AND'|'OR'>, rules: ({field, id, operator, value}|{condition})[]}}
     disabled: boolean
)
    QueryBuilder(
        rules: {{ <'$and'|'$or'>: ({id, label, type}|rules)[] }}
        rules1: {{condition: <'AND'|'OR'>, rules: ({field, id, operator, value}|{condition})[]}}
        disabled: boolean
        makeItemComponent: function
        handlers: {}
    )
        RulesGroupContainer(
            index: number[] // [] - root, [1, 2] - 2nd child at 1st child of root
            makeItemComponent: function
            ruleIsAnd: boolean
            ruleItems: []
            disabled: boolean
            handlers: {}
        )
            RulesGroupHeader(
                index: number[] // [] - root, [1, 2] - 2nd child at 1st child of root
                disabled: boolean
                isAnd: boolean
                onSwitch: function(boolean)
                onAdd: function(boolean)
                onDelete: ?function()
            )
            RulesGroupBody(
                index: number[] // [] - root, [1, 2] - 2nd child at 1st child of root
                items: Object[]
                disabled: boolean
                makeItemComponent: Component
                handlers: {}
            )
                RulesGroupContainer(...)
                itemComponent(...)

 */


class FilterQueryBuilder extends Component {
    render() {
        const fields = this.props.fields;
        const rules = this.props.rules;
        const disabled = this.props.disabled;
        const dispatch = this.props.dispatch;

        const parsedRules = filterUtils.getRulesFromGenomics(rules);
/* check all fields types
        (function() {
            console.log('field types:');
            var types = {};
            var jsTypes = {};
            fields.map( (f) => { types[f.type] = true; jsTypes[fieldUtils.getFieldJSType(f)] = true; } );
            console.log(types, jsTypes);
        })();
*/
        function getFieldById(id) {
            var i;
            for (i = 0; i < fields.length; i++) {
                if (id == fields[i].id) {
                    return fields[i];
                }
            }
        }

        function jsTypeCastValue(val, type) {
            var cast = {
                'string': (val) => '' + val,
                'number': (val) => +val,
                'boolean': (val) => val === 'false' ? false : !!val
            }[type];
            return cast ? cast(val) : null;
        }

        function jsTypeCastArray(val, type, len) {
            if (!val || typeof val !== 'object' || !val.length) {
                return new Array(len || 1).fill(jsTypeCastValue(val, type));
            } else {
                return val
                    .slice(0, len ? len : val.length)
                    .map((v) => jsTypeCastValue(v, type))
                    .concat(
                        new Array(len > val.length ? len - val.length : 0)
                            .fill(jsTypeCastValue(val[val.length - 1], type))
                    );
            }
        }

        function isAllowedOperatorType(operator, type) {
            //return operator.allow[type]; // TODO: optimize
            return operator.apply_to.indexOf(type) >= 0;
        }

        function getValidOperationsTypesForJSType(fieldJSType) {
            var ops = [];
            filterUtils.operators.map( (op) => { if (op.apply_to.indexOf(fieldJSType) >= 0) ops.push(op.type); } );
            return ops;
        }

        function getValidOperationsTypesForField(field) {
            return getValidOperationsTypesForJSType(fieldUtils.getFieldJSType(field));
        }

        const fieldDefault = fields[Object.keys(fields)[0]].id;
        function getValidFieldsIdsForOperation(fields, operation) {
            var validFieldsIds = {};
            fields.map( (field) => {
                const fieldJSType = fieldUtils.getFieldJSType(field);
                if (isAllowedOperatorType(operation, fieldJSType)) {
                    validFieldsIds[field.id] = true;
                }
            });
            return validFieldsIds;
        }

        function validateRules(rules) {

            function validateRule(rule) {
                if (!rule) {
                    return {errorMessage: 'no rule'};
                }
                if (rule.condition) {
                    return {isGroup: true};
                }
                if (!rule.field) {
                    return({errorMessage: 'no field'});
                }
                if (!rule.operator) {
                    return ({errorMessage: 'no operator'});
                }

                const field = getFieldById(rule.field);
                const fieldJSType = fieldUtils.getFieldJSType(field);
                const operatorType = rule.operator;
                const operatorInfo = filterUtils.getOperatorByType(operatorType);

                if (!isAllowedOperatorType(operatorInfo, fieldJSType)) {
                    return {errorMessage: 'field "' + JSON.stringify(field) + '" of type "' + fieldJSType + '" not allowed for operator "' + operatorType + '"'};
                }

                const opWant = filterParser.ops.getOperatorWantedParams(operatorInfo);

                const value = rule.value;
                const castedValue = opWant.noParams ?
                    null :
                    opWant.single ?
                        jsTypeCastValue(value, fieldJSType) :
                        jsTypeCastArray(value, fieldJSType, opWant.arraySize || 0);

                return {validRule: {
                    field: rule.field,
                    operator: rule.operator,
                    value: castedValue/*,
                    valueType: fieldJSType,
                    opWant: opWant*/
                    /*,
                    ops: getValidOperationsForField(field),
                    fieldsAllowed: getValidFieldsIdsForOperation(fields, operatorInfo)*/
                }};
            }

            function validateRules(rules, index, report) {
                var validRules = [];
                rules.map( (val, i) => {
                    var validateRuleResult = validateRule(val);
                    if (validateRuleResult.validRule) {
                        validRules.push(validateRuleResult.validRule);
                        return;
                    }
                    const ruleIndex = index.concat([i]);
                    if (validateRuleResult.isGroup) {
                        const validSubGroup = validateGroup(val, ruleIndex, report);
                        if (!validSubGroup) {
                            report.push({index: ruleIndex.slice(), message: 'invalid subgroup'});
                            return;
                        }
                        validRules.push(validSubGroup);
                        return;
                    }
                    report.push({index: ruleIndex, message: validateRuleResult.errorMessage});
                });
                return validRules;
            }

            function validateGroup(group, index, report) {
                if (group.condition !== 'AND' && group.condition !== 'OR') {
                    report.push({index: index.slice(), message: 'bad group condition "' + group.condition + '" (must be AND|OR)'});
                    return null;
                }
                if (!group.rules || typeof group.rules !== 'object' || !group.rules.length) {
                    report.push({index: index.slice(), message: 'group content (type ' + typeof group.rules + ', !!rule=' + !!group.rules + (group.rules ? ', len = ' + group.rules.length : '') + ')'});
                    return null;
                }
                const validRules = validateRules(group.rules, index, report);
                if (!validRules.length) {
                    report.push({index: index.slice(), message: 'empty group'});
                    return null;
                }
                return {condition: group.condition, rules: validRules};
            }

            var report = [];
            var validRules = validateGroup(rules, [], report);

            return {validRules: validRules, report: report};
        }

        function findSubrules(index) {
            var searchIndex = index.slice();
            var subrules = parsedRules;
            var indexNow;
            while (searchIndex.length) {
                subrules = subrules.rules;
                indexNow = searchIndex.shift();
                subrules = subrules[indexNow];
            }
            return subrules;
        }

        function findSubrulesWIndex(index) {
            var searchIndex = index.slice();
            var subrules = parsedRules;
            var indexIn = null;
            while (searchIndex.length) {
                subrules = subrules.rules;
                indexIn = searchIndex.shift();
                if (searchIndex.length) {
                    subrules = subrules[indexIn];
                }
            }
            return {subrules: subrules, indexIn: indexIn};
        }

        const handlers = {
            onSwitch(index, isAnd) {
                const subrules = findSubrules(index);
                subrules.condition = isAnd ? 'AND' : 'OR';

                dispatch(filterBuilderChangeAll(filterUtils.getGenomics(parsedRules)));
            },
            onAdd(index, isGroup) {
                const subrules = findSubrules(index);
                if (isGroup) {
                    subrules.rules.push({condition: 'AND', rules: [{id: fieldDefault, field: fieldDefault, operator: 'is_null', value: null}]});
                } else {
                    subrules.rules.push({id: fieldDefault, field: fieldDefault, operator: 'is_null', value: null});
                }
                dispatch(filterBuilderChangeAll(filterUtils.getGenomics(parsedRules)));
            },
            onDeleteGroup(index) {
                const {subrules, indexIn} = findSubrulesWIndex(index);
                if (indexIn != null && subrules.length > 1) {
                    subrules.splice(indexIn, 1);
                    dispatch(filterBuilderChangeAll(filterUtils.getGenomics(parsedRules)));
                }
            },
            onDeleteItem(index, itemIndex) {
                const subrules = findSubrules(index);
                if (subrules.rules.length > 1) {
                    subrules.rules.splice(itemIndex, 1);
                    dispatch(filterBuilderChangeAll(filterUtils.getGenomics(parsedRules)));
                }
            }
        };

        function makeFilterItem(index, item, disabled) {

            return (
                <FieldFilterItem
                    index={index}
                    item={item}
                    fields={fields}
                    disabled={disabled}
                    onChange={ (item) => {

                        const {subrules, indexIn} = findSubrulesWIndex(index);
                        subrules[indexIn] = item;
                        dispatch(filterBuilderChangeAll(filterUtils.getGenomics(parsedRules)));
                    }}
                />
            );
        }

        return <QueryBuilder
            rules={parsedRules}
            disabled={disabled}
            makeItemComponent={makeFilterItem}
            handlers={handlers}
        />
    }
}



class QueryBuilder extends Component {

  render() {
      /** @type {{condition: string, rules: Object[]}} */
      const rules = this.props.rules;
      /** @type {boolean} */
      const disabled = this.props.disabled;
      /** @type function(Object):Component */
      const makeItemComponent = this.props.makeItemComponent;
      const handlers = this.props.handlers;

      return (
          <div>
              <div className="query-builder">
                  <RulesGroupContainer
                      index={[]}
                      makeItemComponent={makeItemComponent}
                      ruleItems={rules.rules}
                      ruleIsAnd={rules.condition == 'AND'}
                      disabled={disabled}
                      handlers={handlers}
                  />
              </div>
          </div>
      );
  }
}

class RulesGroupContainer extends Component {

    render() {
        /** @type {number[]} */
        const index = this.props.index;
        /** @type {function(Object):Component} */
        const makeItemComponent = this.props.makeItemComponent;
        /** @type {Object[]} */
        const ruleItems = this.props.ruleItems;
        /** @type {boolean} */
        const ruleIsAnd = this.props.ruleIsAnd;
        /** @type {boolean} */
        const disabled = this.props.disabled;
        /** @type {{onSwitch: function(boolean), onAdd: function(boolean), onDeleteGroup: function(), onDeleteItem: function(number)}} */
        const handlers = this.props.handlers;

        return (
            <dl className="rules-group-container">
                <RulesGroupHeader
                    index={index}
                    disabled={disabled}
                    isAnd={ruleIsAnd}
                    onSwitch={ (isAnd) => { handlers.onSwitch(index, isAnd); }  }
                    onAdd={ (isGroup) => { handlers.onAdd(index, isGroup); } }
                    onDelete={ () => { handlers.onDeleteGroup(index); } }
                />
                <RulesGroupBody
                    index={index}
                    items={ruleItems}
                    disabled={disabled}
                    makeItemComponent={makeItemComponent}
                    handlers={handlers}
                />
            </dl>
        );
    }
}

class RulesGroupHeader extends Component {
    render() {
        /** @type {number[]} */
        const index = this.props.index;
        /** @type {boolean} */
        const isAnd = this.props.isAnd;
        /** @type {boolean} */
        const disabled = this.props.disabled;
        /** @type {function(boolean)} */
        const onSwitch = this.props.onSwitch;
        /** @type {function(boolean)} */
        const onAdd = this.props.onAdd;
        /** @type {?function()} */
        const onDelete = this.props.onDelete;

        const BUTTON_VALUES = { AND: 'AND', OR: 'OR' };

        function makeAddButton(caption, disabled, onAdd) {
            return (
                <button type="button" className="btn btn-xs btn-success" disabled={disabled} onClick={onAdd}>
                    <i className="glyphicon glyphicon-plus"/> {caption}
                </button>
            );
        }

        function makeRadioButton(caption, value, groupName, isOn, disabled, onSwitch) {

            function onChange(evt) {
                const isAnd = evt.target.value == BUTTON_VALUES.AND;
                onSwitch(isAnd);
            }

            return (
                <label className={"btn btn-xs btn-default " + (isOn ? 'active': '')}>
                    <input
                        type="radio"
                        name={groupName}
                        value={value}
                        disabled={disabled}
                        checked={isOn}
                        onChange={onChange} />
                    {caption}
                </label>
            );
        }

        var groupName = 'builder-basic-react_group_' + index.join('-') + '_cond';

        return (
            <dt className="rules-group-header">
                <div className="btn-group pull-right group-actions">
                    {makeAddButton('Add rule', disabled, () => { onAdd(false); })}
                    {makeAddButton('Add group', disabled, () => { onAdd(true); })}
                    {onDelete &&
                        <button type="button" className="btn btn-xs btn-danger" onClick={onDelete} disabled={disabled} >
                            <i className="glyphicon glyphicon-remove" /> Delete
                        </button>
                    }
                </div>
                <div className="btn-group group-conditions">
                    {makeRadioButton('AND', BUTTON_VALUES.AND, groupName, isAnd, disabled, onSwitch)}
                    {makeRadioButton('OR', BUTTON_VALUES.OR, groupName, !isAnd, disabled, onSwitch)}
                </div>
                <div className="error-container"><i className="glyphicon glyphicon-warning-sign" /></div>
            </dt>
        );
    }
}


class RulesGroupBody extends Component {

    render() {

        /** @type {number[]} */
        const index = this.props.index;
        /** @type {Object[]} */
        const items = this.props.items;
        /** @type {Component} */
        const makeItemComponent = this.props.makeItemComponent;
        /** @type {boolean} */
        const disabled = this.props.disabled;
        const handlers = this.props.handlers;


        function RuleContainer(props) {
            return (
                <li className="rule-container">
                    <div className="rule-header">
                        <div className="btn-group pull-right rule-actions">
                            {props.onDelete &&
                                <button
                                    type="button"
                                    className="btn btn-xs btn-danger"
                                    onClick={() => { props.onDelete() }}
                                    disabled={props.disabled}
                                >
                                    <i className="glyphicon glyphicon-remove"/> Delete
                                </button>
                            }
                        </div>
                    </div>
                    <div className="error-container"><i className="glyphicon glyphicon-warning-sign" /></div>
                    {props.makeItemComponent(props.indexNext, props.item, props.disabled)}
                </li>
            );
        }


        function makeRuleContainer(indexNext, key, item, disabled, makeItemComponent, onDelete) {
            return (
                <li className="rule-container" key={key}>
                    <div className="rule-header">
                        <div className="btn-group pull-right rule-actions">
                            {onDelete &&
                            <button
                                type="button"
                                className="btn btn-xs btn-danger"
                                onClick={() => { onDelete() }}
                                disabled={disabled}
                            >
                                <i className="glyphicon glyphicon-remove"/> Delete
                            </button>
                            }
                        </div>
                    </div>
                    <div className="error-container"><i className="glyphicon glyphicon-warning-sign" /></div>
                    {makeItemComponent(indexNext, item, disabled)}
                </li>
            );
        }

        function makeGroupContainer(index1, key, parsedRule, disabled, makeItemComponent) {
            return (
                <RulesGroupContainer
                    index={index1}
                    key={key}
                    ruleItems={parsedRule.items}
                    ruleIsAnd={parsedRule.group.isAnd}
                    disabled={disabled}
                    makeItemComponent={makeItemComponent}
                    handlers={handlers}
                />
            );
        }

        return (
            <dd className="rules-group-body">
                <ul className="rules-list">
                    {
                        items.map( (item, itemIndex) => {
                            const indexNext = index.concat(itemIndex);
                            if (item.condition) {
                                //return <h1>{item.condition}</h1>
                                return <RulesGroupContainer
                                    index={indexNext}
                                    key={itemIndex}
                                    ruleItems={item.rules}
                                    ruleIsAnd={item.condition == 'AND'}
                                    disabled={disabled}
                                    makeItemComponent={makeItemComponent}
                                    handlers={handlers}
                                />
                            } else {
                                return <RuleContainer
                                    key={itemIndex}
                                    indexNext={indexNext}
                                    item={item}
                                    disabled={disabled}
                                    makeItemComponent={makeItemComponent}
                                    onDelete={ () => handlers.onDeleteItem(index, itemIndex) }
                                />
                            }
                        })
                    }
                </ul>
            </dd>
        );
    }
}



class Input extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value
        };
    }

    render() {
        const value = this.state.value;
        const onChange = this.props.onChange;

        return (
            <input
                {...this.props}
                value={value}
                onChange={ (evt) => this.setState({value: evt.target.value}) }
                onBlur={ (evt) => onChange(evt.target.value) }
                onKeyDown={ (evt) => { if (evt.keyCode == 13) onChange(value) } }
            />
        );
    }
}



class FieldFilterItem extends Component {
    render() {
        //return <span>{JSON.stringify(this.props.item)}</span>
        /** {number[]} */
        const index = this.props.index;
        /** @type {{fieldId: string, fieldCondition: Object.<string, string|number|boolean|null|Array.<string|number>>}} */
        const item = this.props.item;
        /** @type {Array.<{id: string, label: string, type: string}>} */
        const fields = this.props.fields;
        /** @type {boolean} */
        const disabled = this.props.disabled;
        /** @type {function({fieldId: string, fieldCondition: Object.<string, string|number|boolean|null|Array.<string|number>>})} */
        const onChange = this.props.onChange;

        const selectOptionsList = fields.map( (field) => { return {value: field.id, label: field.label} } );
        const selectOptionValue = item.field;

        const opsListForSelect = filterParser.ops.genomicsRulesOperatorsList.map( (opname) => { return {value: opname, label: filterParser.ops.genomicsRuleOperatorsLabels[opname]}; });

        function makeInputForSingleValue(value, disabled, onChange) {
            var inputInfo = {
                    'number': {attributes: {type: 'number', value: value}, getValue(el) { return +el.value; }, isText: true},
                    'boolean': {attributes: {type: 'checkbox', checked: !!value}, getValue(el) { return el.checked; }, isText: false}
                }[typeof value] || {attributes: {type: 'text', value: value}, getValue(el) { return el.value; }, isText: true };
            return (
                inputInfo.isText ?
                    <Input
                        className="form-control"
                        {...inputInfo.attributes}
                        disabled={disabled}
                        onChange={ (val) => onChange(val) }
                    /> :
                    <input
                        className="form-control"
                        {...inputInfo.attributes}
                        disabled={disabled}
                        onChange={ (evt) => onChange(inputInfo.getValue(evt.target)) }
                    />
            );
        }

        function makeInputList(values, disabled, onChange) {
            return (
                <div className="rule-value-array">
                    {values.map( (value, index) => {
                        return (
                            <div key={index} className="rule-value-array-item">
                                {makeInputForSingleValue(value, disabled, (val) => onChange(index, val) )}
                            </div>
                        );
                    })}
                </div>
            );
        }

        return (
            <div>
                <div className="rule-filter-container">
                    <Select
                        className="selectTree"
                        options={selectOptionsList}
                        value={selectOptionValue}
                        clearable={false}
                        disabled={disabled}
                        onChange={(val) => {
                            onChange({
                                id: val.value,
                                field: val.value,
                                operator: item.operator,
                                value: item.value
                            });
                        }}
                    />
                </div>
                <div className="rule-operator-container rule-operator-container-operation">
                    <Select
                        className="select2"
                        options={opsListForSelect}
                        value={item.operator}
                        clearable={false}
                        disabled={disabled}
                        onChange={ (val) => {
                            onChange({
                                id: item.id,
                                field: item.field,
                                operator: val.value,
                                value: item.value
                            });
                        }}
                    />
                </div>
                <div className="rule-value-container">
                    {
                        typeof item.value === 'object' ?
                            item.value && item.value.length ?
                                makeInputList(item.value, disabled, (i, val) => {
                                    var values = prop.item.value.slice();
                                    values[i] = val;
                                    onChange({
                                        id: item.id,
                                        field: item.field,
                                        operator: item.operator,
                                        value: values
                                    });
                                })
                                :
                                makeInputList([])
                            :
                            makeInputForSingleValue(item.value, disabled, (val) => {
                                onChange({
                                    id: item.id,
                                    field: item.field,
                                    operator: item.operator,
                                    value: val
                                });
                            })
                    }
                </div>
            </div>
        )
    }
}


class NullFilterItem extends Component {
    render() {
        return <div>item</div>
    }
}

const makeKey = (function() {
    var key;
    return function() {
        key = (key + 1) || 0;
        return key;
    };
})();

class InputResizingArray extends Component {

    static toKeyed(vals) {
        return vals.map( (v) => ({val: v, key: makeKey()}) );
    }

    static addEmpty(vals) {
        return vals.concat([{val: '', key: makeKey()}]);
    }

    static fromKeyed(vals) {
        return vals.map( (v) => v.val );
    }

    static removeEmpty(vals) {
        return vals.filter( (v) => v.val != '' );
    }

    constructor(props) {
        super(props);
        this.state = {
            value: InputResizingArray.addEmpty(InputResizingArray.toKeyed(props.value))
        };
    }

    render() {
        const self = this;

        function onEditIndex(val, index) {
            var arr = self.state.value.slice();
            if (val == '') {
                arr.splice(index, 1);
            } else {
                arr[index].val = val;
                if (index >= self.state.value.length - 1) {
                    arr = InputResizingArray.addEmpty(arr);
                }
            }
            self.setState({value: arr});
            self.props.onChange(InputResizingArray.fromKeyed(InputResizingArray.removeEmpty(arr)));
        }

        return <div>
            {this.state.value.map( (val, i) => {
                return <Input key={val.key} {...this.props} value={val.val} onChange={ (val) => onEditIndex(val, i) } />
            })}
        </div>
    }
}

class InputArray extends Component {

    constructor(props) {
        super(props);
        this.state = {
            value: InputResizingArray.toKeyed(props.value)
        };
    }

    render() {
        const self = this;

        function onEditIndex(val, index) {
            var arr = self.state.value.slice();
            arr[index].val = val;
            self.setState({value: arr});
            self.props.onChange(InputResizingArray.fromKeyed(arr));
        }

        return <div>
            {this.state.value.map( (val, i) => {
                return <Input key={val.key} {...this.props} value={val.val} onChange={ (val) => onEditIndex(val, i) } />
            })}
        </div>
    }
}

export default class FilterBuilder extends Component {

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.fields !== nextProps.fields
      || this.props.filterBuilder !== nextProps.filterBuilder;
  }

  makeFieldsList(fields) {

/*
There was two arrays:

at componentDidMount:
  ...fields.notEditableFields.map( (f) => { return {id: f.id, label: `${f.name} -- ${f.source_name}`, type: f.value_type === 'float' ? 'double' : f.value_type} } ),
  ...fields.sourceFieldsList.filter((f) => (f.source_name !== 'sample')).map( (f) => { return {id: f.id, label: `${f.name} -- source`, type: f.value_type === 'float' ? 'double' : f.value_type }} )

at componentWillUpdate:
 ...fields.sampleFieldsList.map( (f) => { return {id: f.id, label: `${f.label} -- ${f.source_name}`, type: f.value_type === 'float' ? 'double' : f.value_type} } ),
 ...fields.sourceFieldsList.filter((f) => (f.source_name !== 'sample')).map( (f) => { return {id: f.id, label: `${f.label} -- source`, type: f.value_type === 'float' ? 'double' : f.value_type }} )

1st part is from 'notEditableFields' at 'componentDidMount' vs 'sampleFieldsList' at 'componentWillUpdate'
and all '.name' at componentDidMount vs '.label' at 'componentWillUpdate'

There must be not editable fields to prevent select gender for the person
*/

    function getFieldValue(f, sourceName) {
      return {
        id: f.id,
        label: `${f.label} -- ${(sourceName == null ? f.source_name : sourceName)} (${f.value_type})`,
        type: f.value_type === 'float' ? 'double' : f.value_type
      };
    }

    return [
      ...fields.notEditableFields.map( (f) => getFieldValue(f) ),
      ...fields.sourceFieldsList.filter( (f) => (f.source_name !== 'sample') ).map( (f) => getFieldValue(f, 'source') )
    ];
  }

  render() {
    const { editOrNew, rulesRequested, editedFilter, newFilter } = this.props.filterBuilder;
    const filter = editOrNew ? (editedFilter):(newFilter);
    return (
      <div className="builder-wrapper">
          <div>{filter.type || 'no type' + typeof filter.type + '   ' + JSON.stringify(filter)}</div>
        <FilterQueryBuilder
            fields={this.makeFieldsList(this.props.fields)}
            rules={filter.rules}
            disabled={filter.type === 'standard' || filter.type == 'advanced'}
            dispatch={this.props.dispatch}
        />
      </div>
    );
  }
}
