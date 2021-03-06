import { GraphBuilder } from "./graph-builder";
import { Graph } from "./graph";
import { Vertex } from "./vertex";
import { EdgeGenerator } from "../algorithm/edge-generator";
import { SimpleEdgeGenerator } from "../algorithm/simple-edge-generator";
import { DialogflowParser, Intent } from "../parser/dialogflow-parser";
import { DfWelcomeVertex } from "./df-welcome-vertex";
import { ContextAsLabelEdgeFactory } from "./context-as-a-label-edge-factory";

export class EdgeListGraphBuilder extends GraphBuilder {
  private _parser: DialogflowParser;

  /**
   * Getter parser
   * @return {DialogflowParser}
   */
	public get parser(): DialogflowParser {
		return this._parser;
	}

  /**
   * Setter parser
   * @param {DialogflowParser} value
   */
	public set parser(value: DialogflowParser) {
		this._parser = value;
	}
  
  constructor(parser: DialogflowParser) {
    super();
    this._parser = parser;
  }
  buildGraph(): void {
    this.graph = new Graph();
  }

  buildEdges(): void {
    // TODO: (atulep) Maybe making an edge factory into instance variable and have it as singleton would be better.
    const edgeGenerator: EdgeGenerator = new SimpleEdgeGenerator(this.graph.vertices, new ContextAsLabelEdgeFactory());
    this.graph.edges = edgeGenerator.generateEdges();
  }

  buildVertices(): void {
    let vertices: Array<Vertex> = []
    for (let intent of this.parser.agent.intents) {
      const parsedIntent: Intent = this.parser.parseIntent(intent);
      let vertex: Vertex;
      if (parsedIntent.events.includes(this.parser.DF_WELCOME_INTENT)) {
        vertex = new DfWelcomeVertex(parsedIntent);
      } else {
        vertex = new Vertex(parsedIntent);
      }
      vertices.push(vertex);
    }
    this.graph.vertices = vertices;
  }
}