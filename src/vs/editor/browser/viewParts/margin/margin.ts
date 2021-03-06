/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { FastDomNode, createFastDomNode } from 'vs/base/browser/fastDomNode';
import { ViewPart } from 'vs/editor/browser/view/viewPart';
import { RenderingContext, RestrictedRenderingContext } from 'vs/editor/common/view/renderingContext';
import { ViewContext } from 'vs/editor/common/view/viewContext';
import * as viewEvents from 'vs/editor/common/view/viewEvents';

export class Margin extends ViewPart {

	public static readonly CLASS_NAME = 'glyph-margin';
	public static readonly OUTER_CLASS_NAME = 'margin';

	private readonly _domNode: FastDomNode<HTMLElement>;
	private _canUseLayerHinting: boolean;
	private _contentLeft: number;
	private _glyphMarginLeft: number;
	private _glyphMarginWidth: number;
	private _glyphMarginBackgroundDomNode: FastDomNode<HTMLElement>;

	constructor(context: ViewContext) {
		super(context);
		this._canUseLayerHinting = this._context.configuration.editor.canUseLayerHinting;
		this._contentLeft = this._context.configuration.editor.layoutInfo.contentLeft;
		this._glyphMarginLeft = this._context.configuration.editor.layoutInfo.glyphMarginLeft;
		this._glyphMarginWidth = this._context.configuration.editor.layoutInfo.glyphMarginWidth;

		this._domNode = createFastDomNode(document.createElement('div'));
		this._domNode.setClassName(Margin.OUTER_CLASS_NAME);
		this._domNode.setPosition('absolute');
		this._domNode.setAttribute('role', 'presentation');
		this._domNode.setAttribute('aria-hidden', 'true');

		this._glyphMarginBackgroundDomNode = createFastDomNode(document.createElement('div'));
		this._glyphMarginBackgroundDomNode.setClassName(Margin.CLASS_NAME);

		this._domNode.appendChild(this._glyphMarginBackgroundDomNode);
	}

	public dispose(): void {
		super.dispose();
	}

	public getDomNode(): FastDomNode<HTMLElement> {
		return this._domNode;
	}

	// --- begin event handlers

	public onConfigurationChanged(e: viewEvents.ViewConfigurationChangedEvent): boolean {
		if (e.canUseLayerHinting) {
			this._canUseLayerHinting = this._context.configuration.editor.canUseLayerHinting;
		}

		if (e.layoutInfo) {
			this._contentLeft = this._context.configuration.editor.layoutInfo.contentLeft;
			this._glyphMarginLeft = this._context.configuration.editor.layoutInfo.glyphMarginLeft;
			this._glyphMarginWidth = this._context.configuration.editor.layoutInfo.glyphMarginWidth;
		}

		return true;
	}
	public onScrollChanged(e: viewEvents.ViewScrollChangedEvent): boolean {
		return super.onScrollChanged(e) || e.scrollTopChanged;
	}

	// --- end event handlers

	public prepareRender(ctx: RenderingContext): void {
		// Nothing to read
	}

	public render(ctx: RestrictedRenderingContext): void {
		this._domNode.setLayerHinting(this._canUseLayerHinting);
		const adjustedScrollTop = ctx.scrollTop - ctx.bigNumbersDelta;
		this._domNode.setTop(-adjustedScrollTop);

		const height = Math.min(ctx.scrollHeight, 1000000);
		this._domNode.setHeight(height);
		this._domNode.setWidth(this._contentLeft);

		this._glyphMarginBackgroundDomNode.setLeft(this._glyphMarginLeft);
		this._glyphMarginBackgroundDomNode.setWidth(this._glyphMarginWidth);
		this._glyphMarginBackgroundDomNode.setHeight(height);
	}
}
