import { Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';
import { ScriptRef } from 'src/app/core/models';

@Directive({
  selector: '[pruScriptLogWriter]'
})
export class ScriptLogWriterDirective implements OnInit, OnDestroy {

  private _scriptRef: ScriptRef;
  private _stdoutSubscription: Subscription;
  private _stderrorSubscription: Subscription;
  private _exitSubscription: Subscription;

  @Input() public set scriptRef(value: ScriptRef) {
    this.unsubscribeAll();

    this._scriptRef = value;

    if (this._scriptRef) {
      this._stdoutSubscription = this._scriptRef.stdout.subscribe(line => this.addLine(line));
      this._stderrorSubscription = this._scriptRef.stderr.subscribe(line => this.addLine(line, true));
    }
  }

  public get scriptRef(): ScriptRef {
    return this._scriptRef;
  }

  constructor(
    private _element: ElementRef,
    private _renderer: Renderer2
  ) { }

  public ngOnInit(): void {
  }

  public ngOnDestroy(): void {
    this.unsubscribeAll();
  }

  private unsubscribeAll(): void {
    if (this._stdoutSubscription) {
      this._stdoutSubscription.unsubscribe();
    }

    if (this._stderrorSubscription) {
      this._stdoutSubscription.unsubscribe();
    }

    if (this._exitSubscription) {
      this._stdoutSubscription.unsubscribe();
    }
  }

  private addLine(line: string, isError: boolean = false): void {
    console.log('EL', line);
    const lineElement = this._renderer.createElement('li');
    this._renderer.addClass(lineElement, 'log-line');
    if (isError) {
      this._renderer.addClass(lineElement, 'log-line-error');
    }

    const lineText = this._renderer.createText(line);
    this._renderer.appendChild(lineElement, lineText);

    this._renderer.appendChild(this._element.nativeElement, lineElement);
  }
}
