package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"os"
	"os/exec"
)

func index(c *gin.Context) {
	content := gin.H{"Hello": "World"}
	c.JSON(200, content)
}

func action(c *gin.Context) {
	cmd := "uvcdynctrl"
	action := c.Params.ByName("action")
	args := ""
	reset := false

	switch action {
	case "up":
		args = "-s 'Tilt (relative)' -- 1000"
	case "down":
		args = "-s 'Tilt (relative)' -- -1000"
	case "left":
		args = "-s 'Pan (relative)' -- -1000"
	case "right":
		args = "-s 'Pan (relative)' -- 1000"
	case "reset":
		args = "-s 'Pan reset"
		reset = true
	}

	if reset {
		if err := exec.Command(cmd, "-s 'Tilt reset'").Run(); err != nil {
			fmt.Fprintln(os.Stderr, err)
		}
	}

	if err := exec.Command(cmd, args).Run(); err != nil {
		fmt.Fprintln(os.Stderr, err)

		content := gin.H{
			"success":  "true",
			"response": "",
		}

		c.JSON(200, content)
	} else {
		fmt.Fprintln(os.Stderr, err)

		content := gin.H{
			"success":  "false",
			"response": os.Stderr,
		}

		c.JSON(200, content)

	}
}

func main() {
	app := gin.Default()
	app.GET("/", index)
	app.GET("/api/:action", action)
	app.Run(":8000")
}
