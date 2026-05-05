import './Forms.css';

export default function FormInput({
  label, name, type = 'text', value, onChange, placeholder,
  required, error, disabled, icon: Icon
}) {
  return (
    <div className="form-group">
      {label && <label htmlFor={name} className="form-label">{label}{required && <span className="required">*</span>}</label>}
      <div className="input-wrapper">
        {Icon && <Icon size={18} className="input-icon" />}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`form-input ${Icon ? 'has-icon' : ''} ${error ? 'input-error' : ''}`}
          autoComplete={type === 'password' ? 'current-password' : 'off'}
        />
      </div>
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}
