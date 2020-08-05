import React, { useRef, useCallback, useMemo, useEffect } from 'react';
import { Box, Field, TextInput, ToggleSwitch, RadioButton } from '@rocket.chat/fuselage';

import { useTranslation } from '../../../../client/contexts/TranslationContext';
import { useForm } from '../../../../client/hooks/useForm';

const getInitialValues = (data) => ({
	type: data.type || 'input',
	required: !!data.required,
	defaultValue: data.defaultValue ?? '',
	options: data.options || '',
	public: !!data.public,
});

const checkInvalidOptions = (value) => value.trim() !== '' && !/^([a-zA-Z0-9-_ ]+)(,\s*[a-zA-Z0-9-_ ]+)*$/i.test(value);

const CustomFieldsAdditionalFormContainer = ({ data = {}, state, onChange, className }) => {
	const saveData = useRef({});

	const t = useTranslation();

	const onChangeValue = useCallback(({ initialValue, value, key }) => {
		const { current } = saveData;
		if (JSON.stringify(initialValue) !== JSON.stringify(value)) {
			current[key] = value;
		} else {
			delete current[key];
		}
		onChange({ data: saveData.current });
	}, [onChange]);

	const { values, handlers, hasUnsavedChanges } = useForm(getInitialValues(data), onChangeValue);

	const errors = useMemo(() => ({
		optionsError: checkInvalidOptions(values.options) ? t('error-invalid-value') : undefined,
	}), [t, values.options]);

	const hasError = useMemo(() => !!Object.values(errors).filter(Boolean).length, [errors]);

	useEffect(() => {
		onChange({ hasError });
	}, [hasError, onChange]);

	useEffect(() => {
		onChange({ hasUnsavedChanges });
	}, [hasUnsavedChanges, onChange]);

	return <CustomFieldsAdditionalForm values={values} handlers={handlers} state={state} className={className} errors={errors}/>;
};


const CustomFieldsAdditionalForm = ({ values = {}, handlers = {}, state, className, errors }) => {
	const t = useTranslation();

	const {
		type,
		required,
		defaultValue,
		options,
		public: isPublic,
	} = values;

	const {
		handleType,
		handleRequired,
		handleDefaultValue,
		handleOptions,
		handlePublic,
	} = handlers;

	const { optionsError } = errors;

	return <>
		<Field className={className}>
			<Box display='flex' flexDirection='row'>
				<Field.Label htmlFor='required'>{t('Required')}</Field.Label>
				<Field.Row>
					<ToggleSwitch id='required' checked={required} onChange={handleRequired}/>
				</Field.Row>
			</Box>
		</Field>
		<Field className={className}>
			<Field.Label>{t('Type')}</Field.Label>
			<Field.Row>
				{t('Input')}
				<RadioButton value='input' name='type' checked={type === 'input'} onChange={() => handleType('input')}/>
			</Field.Row>
			<Field.Row>
				{t('Select')}
				<RadioButton value='select' name='type' checked={type === 'select'} onChange={() => handleType('select')}/>
			</Field.Row>
		</Field>
		<Field className={className}>
			<Field.Label>{t('Default_value')}</Field.Label>
			<Field.Row>
				<TextInput value={defaultValue} onChange={handleDefaultValue} placeholder={t('Default_value')}/>
			</Field.Row>
		</Field>
		<Field className={className}>
			<Field.Label>{t('Options')}</Field.Label>
			<Field.Row>
				<TextInput value={options} onChange={handleOptions} error={optionsError} disabled={type === 'input'} placeholder={t('Options')}/>
			</Field.Row>
			<Field.Hint>
				{t('Livechat_custom_fields_options_placeholder')}
			</Field.Hint>
			{optionsError && <Field.Error>
				{optionsError}
			</Field.Error>}
		</Field>
		<Field className={className}>
			<Box display='flex' flexDirection='row'>
				<Field.Label htmlFor='public'>{t('Public')}</Field.Label>
				<Field.Row>
					<ToggleSwitch disabled={!state.visibility} id='public' checked={isPublic} onChange={handlePublic}/>
				</Field.Row>
			</Box>
			<Field.Hint>
				{t('Livechat_custom_fields_public_description')}
			</Field.Hint>
		</Field>
	</>;
};

export default CustomFieldsAdditionalFormContainer;
