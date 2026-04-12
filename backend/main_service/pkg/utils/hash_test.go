package utils_test

import (
	"testing"

	"github.com/Lalit-h2/DF-Detector/backend/main_service/pkg/utils"
)

func TestHash(t *testing.T) {
	var text1, text2 string
	text1 = "password123"
	text2 = "password333"

	var hash1, hash2 string

	hash1, err := utils.Hash(text1)
	if err != nil {
		t.Fatal("Error occured during hash process", err)
	}
	match, err := utils.CompareHash(hash1, text1)
	if !match {
		t.Errorf("Password matching failed for 	%s", text1)
	}

	hash2, err = utils.Hash(text2)
	if err != nil {
		t.Fatal("Error occured during hash process", err)
	}
	match, err = utils.CompareHash(hash2, text1)
	if match {
		t.Errorf("Password match should have failed for %s", text2)
	}

}
