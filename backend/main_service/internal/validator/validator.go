package validator

type Validator struct {
	Errors map[string]string
}

func NewValidator() *Validator {
	return &Validator{Errors: make(map[string]string)}
}

func (v *Validator) IsValid() bool {
	return len(v.Errors) == 0
}

func (v *Validator) AddErr(k, msg string) {
	if _, exists := v.Errors[k]; !exists {
		v.Errors[k] = msg
	}
}

func (v *Validator) Check(ok bool, k, msg string) {
	if !ok {
		v.AddErr(k, msg)
	}
}
