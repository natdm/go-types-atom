package stubs

type TestStruct struct {
}

func (t *TestStruct) TSMethod() error {
	return nil
}

func (t TestStruct) TSNoPtr() error {
	return nil
}

func NotAMethod() {

}
