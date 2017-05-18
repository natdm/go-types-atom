package stubs

type TestStruct2 struct {
}

func (t *TestStruct2) TSMethod() error {
	return nil
}

func (t TestStruct2) TSNoPtr() error {
	return nil
}

func NotAMethod2() {

}
