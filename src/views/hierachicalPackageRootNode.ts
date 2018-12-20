// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license.

import { HierachicalPackageNodeData } from "../java/hierachicalPackageNodeData";
import { INodeData, NodeKind } from "../java/nodeData";
import { DataNode } from "./dataNode";
import { ExplorerNode } from "./explorerNode";
import { FileNode } from "./fileNode";
import { FolderNode } from "./folderNode";
import { HierachicalPackageNode } from "./hierachicalPackageNode";
import { PackageRootNode } from "./packageRootNode";
import { ProjectNode } from "./projectNode";
import { TypeRootNode } from "./typeRootNode";

export class HierachicalPackageRootNode extends PackageRootNode {

    constructor(nodeData: INodeData, parent: DataNode, _project: ProjectNode) {
        super(nodeData, parent, _project);
    }

    public async revealPaths(paths: INodeData[]): Promise<DataNode> {
        // don't shift here, or child hierarchical node may lose data of package node
        const hierarchicalNodeData = paths[0];
        const children: ExplorerNode[] = await this.getChildren();
        const childNode = <DataNode>children.find((child: DataNode) =>
            hierarchicalNodeData.name.startsWith(child.nodeData.name + ".") || hierarchicalNodeData.name === child.nodeData.name);
        return childNode ? (paths.length > 1 ? childNode.revealPaths(paths) : childNode) : null;
    }

    protected createChildNodeList(): ExplorerNode[] {
        const result = [];
        if (this.nodeData.children && this.nodeData.children.length) {
            this.sort();
            this.nodeData.children.forEach((data) => {
                if (data.kind === NodeKind.File) {
                    result.push(new FileNode(data, this));
                } else if (data.kind === NodeKind.Folder) {
                    result.push(new FolderNode(data, this, this._project, this));
                } else if (data.kind === NodeKind.TypeRoot) {
                    result.push(new TypeRootNode(data, this));
                }
            });
        }
        return this.getHierarchicalPackageNodes().concat(result);
    }

    protected getHierarchicalPackageNodes(): ExplorerNode[] {
        const hierachicalPackageNodeData = this.getHierarchicalPackageNodeData();
        return hierachicalPackageNodeData === null ? [] : hierachicalPackageNodeData.children.map((hierachicalChildrenNode) =>
            new HierachicalPackageNode(hierachicalChildrenNode, this, this._project, this));
    }

    private getHierarchicalPackageNodeData(): HierachicalPackageNodeData {
        if (this.nodeData.children && this.nodeData.children.length) {
            const nodeDataList = this.nodeData.children
                .filter((child) => child.kind === NodeKind.Package);
            return HierachicalPackageNodeData.createHierachicalNodeDataByPackageList(nodeDataList);
        } else {
            return null;
        }
    }
}
