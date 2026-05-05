import './Forms.css';

export default function FormSelect({
  label, name, value, onChange, options = [],
  required, error, disabled, placeholder
}) {
  return (
    <div className="form-group">
      {label && <label htmlFor={name} className="form-label">{label}{required && <span className="required">*</span>}</label>}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`form-select ${error ? 'input-error' : ''}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
