// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import axios from 'axios';
import { TreeDataProvider,EventEmitter,Event } from 'vscode';
import { getDefaultSettings } from 'http2';

var code_:string;
var notify_price:string;
var interval_:NodeJS.Timer;

var start_:Boolean = false;

class Jay{
	_name:string
	constructor(name:string){
		this._name = "jay";
	}
	GetName(){
		return this._name;
	}
};

class CJay extends Jay{
	constructor(name:string){
		super(name);
	}

}


function get_stock_info(code:string) {
	let url = "http://hq.sinajs.cn/list=sh" + code_;
	return Promise.resolve(()=>{
			axios.get(url).then(function (response) {
			let _data = response.data
			let _goal_data = _data.split('"')[1];
			let data_info = _goal_data.split(',');
			let name = data_info[0];
			let current_price = data_info[3]; 
			console.log("Name:"+name);
			console.log("Curr_Price:"+current_price);
	
			vscode.window.setStatusBarMessage("Name:"+name);
			vscode.window.setStatusBarMessage("Name:"+name + " Curr_Price:"+current_price);	
			var stock_info = "Name:"+name + ":"+current_price;
	
			if(current_price == notify_price) {
				vscode.window.showInformationMessage("!!! notify_price");
			}
			return stock_info;
	
		}).catch(function (error){
			console.log(error);
			return "...";
		})
	})
}
var stock_info_;
async function request():Promise<string> {
	var stock_info_ =  await get_stock_info(code_);
	return stock_info_.toString();
}

var num= 1;

class TreeViewItem extends vscode.TreeItem {
	// info:string = "Hello";
	constructor(label: string,info:string, collapsibleState?: vscode.TreeItemCollapsibleState) {
		super(label, collapsibleState);
		console.log("num:"+(num++))
	}
}

class StockTreeDataProvider implements TreeDataProvider<TreeViewItem> {

	private _onDidChangeTreeData: EventEmitter<any> = new EventEmitter<any>();

	readonly onDidChangeTreeData: Event<any> = this._onDidChangeTreeData.event;

	getTreeItem(element: TreeViewItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
		return element;
	}

	refresh(): any {
		this._onDidChangeTreeData.fire(undefined);
	}
	
	getChildren(element?: TreeViewItem): vscode.ProviderResult<TreeViewItem[]> {
		return Promise.resolve([
			new TreeViewItem("1111","2222")
		]);
	}
	
}

var stock_provider = new StockTreeDataProvider();






// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "info" is now active!');

	context.subscriptions.push(vscode.commands.registerCommand('stock-info.test', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World Test!');
		const cjay = new CJay("SB");
		console.log(cjay.GetName());

		vscode.window.registerTreeDataProvider("beautifulGirl1",stock_provider);

		var date = new Date();
		console.log(date.getDay());
		console.log(date.getHours());
		console.log(date.getMonth());

		console.log(new Date().getHours())

	}));

	context.subscriptions.push(vscode.commands.registerCommand('stock-info.refresh', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World refresh!');
		stock_provider.refresh();

	}));


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
			code_ = msg as string;

			let commands = vscode.commands.executeCommand("stock-info.start_listening")
		});
	}));

	// set notify pirce
	context.subscriptions.push(vscode.commands.registerCommand('stock-info.set_notify_price',()=>{
		vscode.window.showInputBox({
			placeHolder : "Please input notify price"
		}).then((msg)=>{
			notify_price = msg as string;
		})
	}));
	//start listen
	context.subscriptions.push(vscode.commands.registerCommand('stock-info.start_listening', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('start_listening ... !');
		console.log("console.log");
		//start
		// auto stop
		let hours = new Date().getHours();
		let duration=0;
		if(hours >= 9 && hours <= 12) {
			duration = 12 - hours;
		}else if(hours >=13 && hours <= 15) {
			duration = 15 - hours;
		}else{
			duration = 0;
		}
		start_ = true;
		//test
		// duration = 1;

		interval_ = setInterval((arg)=>{
			// console.log("arg:"+arg)
			if (typeof(arg) == "undefined") {
				vscode.window.showErrorMessage("The stock code is not set ! please set stock code first");
				clearInterval(interval_);
				return
			}

			let url = "http://hq.sinajs.cn/list=sh" + arg;
			axios.get(url).then(function (response) {
			let _data = response.data
			let _goal_data = _data.split('"')[1];
			let data_info = _goal_data.split(',');
			let name = data_info[0];
			let current_price = data_info[3]; 
			console.log("Name:"+name);
			console.log("Curr_Price:"+current_price);
	
			vscode.window.setStatusBarMessage("Name:"+name);
			vscode.window.setStatusBarMessage("Name:"+name + " Curr_Price:"+current_price);	


			if(start_) {

				if(duration > 0){
					//auto stop
					setTimeout(()=> {
						clearInterval(interval_);
						vscode.window.showInformationMessage("stop get stock info");
	
					},1000 * 3600 * duration);// <= 2 hours
				}else{
					vscode.window.setStatusBarMessage("Name:"+name + " Close_Price:"+current_price);
					clearInterval(interval_);	
				}
			}
	
			if(current_price == notify_price) {
				vscode.window.showInformationMessage("!!! notify_price");
			}
			}).catch(function (error){
			})


		},3000,code_);

		
	}));
}

// this method is called when your extension is deactivated
export function deactivate() {}
