import { Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Subscription } from 'rxjs';
import { ScriptRef, IScriptExit } from 'src/app/core/models';
import { StatusService } from 'src/app/core/services';

@Directive({
  selector: '[pruScriptLogWriter]'
})
export class ScriptLogWriterDirective implements OnInit, OnDestroy {

  @Input() public set scriptRef(value: ScriptRef) {
    this.unsubscribeAll();
    this._element.nativeElement.innerHTML = '';

    this._scriptRef = value;

    if (this._scriptRef) {
      this._stdoutSubscription = this._scriptRef.stdout.subscribe(line => this.addLine(line));
      this._stderrorSubscription = this._scriptRef.stderr.subscribe(line => this.addLine(line, true));
      this._exitSubscription = this._scriptRef.exit.subscribe((scriptExit: IScriptExit) => {
        const message = scriptExit.exitCode === 0 ? ' completed' : ` failed with exit code ${scriptExit.exitCode}`;
        this._statusService.setStatus(`${this.scriptRef.script.module.toUpperCase()}/${this.scriptRef.script.name} ${message}`);
      });
    }
  }

  public get scriptRef(): ScriptRef {
    return this._scriptRef;
  }

  private _scriptRef: ScriptRef;
  private _stdoutSubscription: Subscription;
  private _stderrorSubscription: Subscription;
  private _exitSubscription: Subscription;

  constructor(
    private _element: ElementRef,
    private _renderer: Renderer2,
    private _statusService: StatusService
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
    const lineElement = this._renderer.createElement('li');
    this._renderer.addClass(lineElement, 'log-line');
    if (isError) {
      this._renderer.addClass(lineElement, 'log-line-error');
    }

    const lineText = this._renderer.createText(line);
    this._renderer.appendChild(lineElement, lineText);

    this._renderer.appendChild(this._element.nativeElement, lineElement);

    if (this.scriptRef.tail) {
      this.scrollToBottom();
    }
  }

  private scrollToBottom(): void {

    // SourceRef: https://stackoverflow.com/questions/35232731/angular-2-scroll-to-bottom-chat-style
    try {
        this._element.nativeElement.scrollTop = this._element.nativeElement.scrollHeight;
    } catch (err) { }
  }
}
