import express from "express";
import httpProxy from "http-proxy";
import { sessionStore, StudentSession } from "../data/session";
const k8s = require("@kubernetes/client-node");

//const Client = K8sClient.Client1_22;
//const k8s = new Client({ version: "1.22" });

const kc = new k8s.KubeConfig();

kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

export const appProxy = express.Router();
const proxy = httpProxy.createProxyServer();

proxy.on("error", (error, req, res, next) => {
  console.error(error.stack)
  res.end();
})

appProxy.use((req, res, next) => {
  if(!req.cookies["session_id"]) {
    return res.sendStatus(404);
  }
  next();
});

appProxy.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

appProxy.all("/burp", async (req, res) => {
  let source: string = "";
  const session = sessionStore.get(req.cookies["session_id"]);
  try {
    const namespace = await k8sApi.readNamespace((session as StudentSession).user.namespace);  
    console.log("Namespace: ", namespace);
  } catch {
    console.log("namespace not found - creating");
    const createResult = await k8sApi.createNamespace({
      metadata: {
        name: (session as StudentSession).user.namespace
      }
    });
    console.log("create result - ", createResult);
  }
  console.log("proxying to ", source);
  // const testFetch = fetch("http://" + source);
  req.url = req.url.replace(/^\/burp/, "/");
  try {
    console.log("Reached try");
    // k8sApi;
    proxy.web(req, res, {target: `http://${source}`});
    console.log("next");
  } catch(error) {
    //never lands in here because whomever wrote the http-proxy package didn't consider the possiblity that resources are sometimes unavailable. Like a fucknut. Who has never used a reverse proxy in a prod environment.
    console.log("entered catch");
    res.sendStatus(500);
  }
});

function startFirefox() {
  `apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: portcullis-app
  spec:
    replicas: 1
    selector:
      matchLabels:
        app: portcullis-app
    template:
      metadata:
        labels:
          app: portcullis-app
      spec:
        containers:
        - name: portcullis-app
          image: micwhitehorngillam/castle-portcullis
          resources:
            limits:
              memory: "128Mi"
              cpu: "500m"
          ports:
          - name: gate-web-ui
            containerPort: 4000
  
  ---
  apiVersion: v1
  kind: Service
  metadata:
    name: portcullis-service
  spec:
    type: NodePort
    selector:
      app: portcullis-app
    ports:
    - port: 4000
      protocol: TCP
      targetPort: gate-web-ui
      nodePort: 31000
  ---
  apiVersion: networking.k8s.io/v1
  kind: Ingress
  metadata:
    name: castle-ingress
    annotations:
      nginx.ingress.kubernetes.io/rewrite-target: /$2
  spec:
    rules:
    - http:
        paths:
        - pathType: Prefix
          path: /(.*)
          backend:
            service:
              name: portcullis-service
              port:
                number: 4000
  ---`
}