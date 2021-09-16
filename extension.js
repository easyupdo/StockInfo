// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

const axois = require('axios');
const { default: axios } = require('axios');

// var schedule = require('node-schedule');


var code_;
var notify_price;
var interval_;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "info" is now active!');

	// var date = new Date(18, 26, 0);
 
	// var j = schedule.scheduleJob(date, function(){
	// 	console.log('现在时间：',new Date());
	// });

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	context.subscriptions.push(vscode.commands.registerCommand('stock-info.set_code', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Info!');
		
		vscode.window.showInputBox(
			{
				placeHolder : "Please input code"
			}
		).then((msg)=>{
			console.log("Input:"+msg)
			code_ = msg;
		});


	}));

	// set notify pirce
	context.subscriptions.push(vscode.commands.registerCommand('stock-info.set_notify_price',()=>{
		vscode.window.showInputBox({
			placeHolder : "Please input notify price"
		}).then((msg)=>{
			notify_price = msg;
		})
	}));
	//start listen
	context.subscriptions.push(vscode.commands.registerCommand('stock-info.start_listening', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('start_listening ... !');
		// vscode.window.createStatusBarItem()
		vscode.window.setStatusBarMessage("HelloJay");
		console.log("console.log");

		interval_ = setInterval((arg)=>{
			// console.log("arg:"+arg)
			if (typeof(arg) == "undefined") {
				vscode.window.showErrorMessage("The stock code is not set ! please set stock code first");
				clearInterval(interval_);
				return
			}

			let url = "http://hq.sinajs.cn/list=sh" + arg;

			axios.get(url).then(function (response) {
			// console.log(response.data);
			// let json_ = JSON.parse(response);
			let _data = response.data
			let _goal_data = _data.split('"')[1];
			let data_info = _goal_data.split(',');
			let name = data_info[0];
			let current_price = data_info[3]; 
			console.log("Name:"+name);
			console.log("Curr_Price:"+current_price);

			vscode.window.setStatusBarMessage("Name:"+name);
			vscode.window.setStatusBarMessage("Name:"+name + " Curr_Price:"+current_price);

			if(current_price == notify_price) {
				vscode.window.showInformationMessage("!!! notify_price");
			}

			
			}).catch(function (error){
				console.log(error)
			})

		},3000,code_);

		
	}));

}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
