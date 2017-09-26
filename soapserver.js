/**
 * Copyright 2015 Neil Kolban.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
 
/**
 * Implement a SOAP listener within a Node-RED environment.
 * This module makes extensive use of the project called "vpulim/node-soap"
 * found on Github at:
 * 
 * https://github.com/vpulim/node-soap
 * 
 * 
 */


module.exports = function(RED) {


  function SoapServerNode(config) {
    var thisNode = this;
    
    RED.nodes.createNode(thisNode, config);
    // node-specific code goes here
    var soap = require("soap");
    var http = require("http");
    var port = parseInt(config.port);
//    var services = [
//	    {method : "startFlow",
//    	     camps : ["camp1","camp2"]},
//	    {method : "startFlow2",
//             camps : ["var1","var2"]},
//            {method : "startFlow3",
//             camps : ["a","b","c"]}
//    ];
        var services = [];
	services = JSON.parse(config.services);
        var schema_element = '';
	var complex_element = '';
	var message_part = '';
	var operation = '';
	var binding_operation = '';
	var serviceurl = (config.serviceurl);	  
        var addlocation = (config.addlocation);
		  
	services.forEach(function (e,i,array){
		schema_element = schema_element + '      <xsd:element name=\"'+e.method+'\" type=\"tns:'+e.method+'\"><\/xsd:element>';	
	});
	
	services.forEach(function (e,i,array){
		var camps = '';
		e.camps.forEach(function (e_camps,i_camps,array_camps){
			camps = camps + '\t\t<xsd:element name=\"'+e_camps+'\" type=\"xsd:string\"><\/xsd:element>';				
		});
		complex_element = complex_element + '<xsd:complexType name=\"'+e.method+'\">      \t<xsd:sequence>'+camps+'      \t<\/xsd:sequence>      <\/xsd:complexType>';
    });

    services.forEach(function (e,i,array){
		message_part = message_part + '  <wsdl:message name=\"'+e.method+'Request\">    <wsdl:part element=\"tns:'+e.method+'\" name=\"parameters\" \/>  <\/wsdl:message>  <wsdl:message name=\"'+e.method+'Response\">    <wsdl:part element=\"tns:'+e.method+'\" name=\"parameters\" \/>  <\/wsdl:message>';
    });

    services.forEach(function (e,i,array){
		operation = operation + '    <wsdl:operation name=\"'+e.method+'\">      <wsdl:input message=\"tns:'+e.method+'Request\"\/>      <wsdl:output message=\"tns:'+e.method+'Response\"\/>    <\/wsdl:operation>';
    });

    services.forEach(function (e,i,array){
        binding_operation = binding_operation + '    <wsdl:operation name=\"'+e.method+'\">      <wsdl:input message=\"tns:'+e.method+'Request\"\/>      <wsdl:output message=\"tns:'+e.method+'Response\"\/>    <\/wsdl:operation>';
    });




    if (isNaN(port)) {
      thisNode.error("No port for soap server node!");
      thisNode.status({fill: "red", shape: "ring", text: "not listening"});
      return;
      
    }
//    if (port == null || isNaN(port)){
//        port = "";
//    }
//    else if (!isNaN(port)){
//    	port = ":" + port
//    }
//    console.log(port);
    
    // Setup an HTTP server to listen for incoming HTTP requests.
    var server = http.createServer(function(request, response){
      response.end("404: Not found: " + request.url);
    });

    // Define the node-soap service definition.
    var nodeRedService = {
      NodeRED: {    // Service name
        NodeRED: {}}};  // Binding name
// Define a handler function for an incoming SOAP request for this flow.  The
// handler function takes the SOAP data and adds it to the payload property of
// the msg.  In addition, the SOAP response callback is added into the msg
// such that it may later be used to send a soap response.
// The WSDL exposed by this service is fixed and hence we know what will be
// incoming.  The args will contain a property called "payload" and that is what we will
// set to the `msg` payload:


     services.forEach(function (e, i, array) {
         //console.log(elemento, indice);
	 nodeRedService.NodeRED.NodeRED[e.method] = function(args, soapResponseCallback) {
            var payload = {};
		    payload["method"]=e.method;
		    e.camps.forEach(function (camps_e, camps_i, camps_array) {
			    payload[camps_e]=args[camps_e];
		    });
            thisNode.send({
              "payload": payload,
              "_soapServer_soapResponseCallback": soapResponseCallback
            });
          };
	  nodeRedService.NodeRED.NodeRED[e.method+"OneWay"] = function(args) {
            thisNode.log(e.method+"OneWay");
          };
     });






//    var wsdl = '<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\
//<wsdl:definitions name=\"NodeRED\" targetNamespace=\"http:\/\/www.neilkolban.com\/NodeRED\/\" xmlns:soap=\"http:\/\/schemas.xmlsoap.org\/wsdl\/soap\/\" xmlns:tns=\"http:\/\/www.neilkolban.com\/NodeRED\/\" xmlns:wsdl=\"http:\/\/schemas.xmlsoap.org\/wsdl\/\" xmlns:xsd=\"http:\/\/www.w3.org\/2001\/XMLSchema\">\
//  <wsdl:types>\
//    <xsd:schema targetNamespace=\"http:\/\/www.neilkolban.com\/NodeRED\/\">\
//      <xsd:element name=\"NodeREDPayload\" type=\"tns:NodeREDPayload\"><\/xsd:element>\
//      <xsd:element name=\"PruebaServicio\" type=\"tns:PruebaServicio\"><\/xsd:element>\
//<xsd:complexType name=\"NodeREDPayload\">\
//      \t<xsd:sequence>\
//      \t\t<xsd:element name=\"camp1\" type=\"xsd:string\"><\/xsd:element>\
//      \t\t<xsd:element name=\"camp2\" type=\"xsd:string\"><\/xsd:element>\
//      \t<\/xsd:sequence>\
//      <\/xsd:complexType>\
//<xsd:complexType name=\"PruebaServicio\">\
//      \t<xsd:sequence>\
//      \t\t<xsd:element name=\"var1\" type=\"xsd:string\"><\/xsd:element>\
//      \t\t<xsd:element name=\"var2\" type=\"xsd:string\"><\/xsd:element>\
//      \t<\/xsd:sequence>\
//      <\/xsd:complexType>\
//    <\/xsd:schema>\
//  <\/wsdl:types>\
//  <wsdl:message name=\"startFlowRequest\">\
//    <wsdl:part element=\"tns:NodeREDPayload\" name=\"parameters\" \/>\
//  <\/wsdl:message>\
//  <wsdl:message name=\"startFlowResponse\">\
//    <wsdl:part element=\"tns:NodeREDPayload\" name=\"parameters\" \/>\
//  <\/wsdl:message>\
//  <wsdl:message name=\"startFlow2Request\">\
//    <wsdl:part element=\"tns:PruebaServicio\" name=\"parameters\" \/>\
//  <\/wsdl:message>\
//  <wsdl:message name=\"startFlow2Response\">\
//    <wsdl:part element=\"tns:PruebaServicio\" name=\"parameters\" \/>\
//  <\/wsdl:message>\
//  <wsdl:portType name=\"NodeRED\">\
//    <wsdl:operation name=\"startFlow\">\
//      <wsdl:input message=\"tns:startFlowRequest\"\/>\
//      <wsdl:output message=\"tns:startFlowResponse\"\/>\
//    <\/wsdl:operation>\
//    <wsdl:operation name=\"startFlow2\">\
//      <wsdl:input message=\"tns:startFlow2Request\"\/>\
//      <wsdl:output message=\"tns:startFlow2Response\"\/>\
//    <\/wsdl:operation>\
//  <\/wsdl:portType>\
//  <wsdl:binding name=\"NodeRED\" type=\"tns:NodeRED\">\
//    <soap:binding style=\"document\" transport=\"http:\/\/schemas.xmlsoap.org\/soap\/http\"\/>\
//    <wsdl:operation name=\"startFlow\">\
//      <soap:operation soapAction=\"http:\/\/www.neilkolban.com\/NodeRED\/startFlow\"\/>\
//      <wsdl:input>\
//        <soap:body use=\"literal\"\/>\
//      <\/wsdl:input>\
//      <wsdl:output>\
//        <soap:body use=\"literal\"\/>\
//      <\/wsdl:output>\
//    <\/wsdl:operation>\
//    <wsdl:operation name=\"startFlow2\">\
//      <soap:operation soapAction=\"http:\/\/www.neilkolban.com\/NodeRED\/startFlow\"\/>\
//      <wsdl:input>\
//        <soap:body use=\"literal\"\/>\
//      <\/wsdl:input>\
//      <wsdl:output>\
//        <soap:body use=\"literal\"\/>\
//      <\/wsdl:output>\
//    <\/wsdl:operation>\
//  <\/wsdl:binding>\
//  <wsdl:service name=\"NodeRED\">\
//    <wsdl:port binding=\"tns:NodeRED\" name=\"NodeRED\">\
//      <soap:address location=\"http:\/\/localhost:'+port+'\/soap\"\/>\
//    <\/wsdl:port>\
//  <\/wsdl:service>\
//<\/wsdl:definitions>\
//';


    var wsdl = '<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\
<wsdl:definitions name=\"NodeRED\" targetNamespace=\"http:\/\/www.neilkolban.com\/NodeRED\/\" xmlns:soap=\"http:\/\/schemas.xmlsoap.org\/wsdl\/soap\/\" xmlns:tns=\"http:\/\/www.neilkolban.com\/NodeRED\/\" xmlns:wsdl=\"http:\/\/schemas.xmlsoap.org\/wsdl\/\" xmlns:xsd=\"http:\/\/www.w3.org\/2001\/XMLSchema\">\
  <wsdl:types>\
    <xsd:schema targetNamespace=\"http:\/\/www.neilkolban.com\/NodeRED\/\">'+schema_element+complex_element+'\
    <\/xsd:schema>\
  <\/wsdl:types>'+message_part+'\
  <wsdl:portType name=\"NodeRED\">'+operation+'\
  <\/wsdl:portType>\
  <wsdl:binding name=\"NodeRED\" type=\"tns:NodeRED\">\
    <soap:binding style=\"document\" transport=\"http:\/\/schemas.xmlsoap.org\/soap\/http\"\/>'+binding_operation+'\
  <\/wsdl:binding>\
  <wsdl:service name=\"NodeRED\">\
    <wsdl:port binding=\"tns:NodeRED\" name=\"NodeRED\">\
      <soap:address location=\"'+addlocation+'\/soap\"\/>\
    <\/wsdl:port>\
  <\/wsdl:service>\
<\/wsdl:definitions>\
';
    soap.listen(server, "/soap", nodeRedService, wsdl);
    
    // Start listening on the HTTP port.
    server.listen(port);
    
    // A request has been made to end the flow so close the server connection
    // that is listening for incoming SOAP requests.
    thisNode.on("close", function(callback) {
      thisNode.status({fill: "yellow", shape: "dot", text: "stopping"});
      server.close(callback);
    });
    
    // Set the status of the node for the editor.
    thisNode.status({fill: "green", shape: "dot", text: "listening"});
  }
  RED.nodes.registerType("soapserver", SoapServerNode);
}
// End of file
