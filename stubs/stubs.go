package stubs

type TestStruct struct {
	FieldA string
}

func (t *TestStruct) TSMethod(x interface{}) error {
	return nil
}

func (t TestStruct) TSNoPtr(x string, y int) error {
	return nil
}

func NotAMethod(x string) {

}

type AnInterface interface {
	Read() error
}

const (
	a = iota + 1
	b
	c

	d = "asdf"
	e = false
)

const f = "asdf"
const g = true

var Things = "asdf"
