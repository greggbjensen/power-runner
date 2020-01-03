import { Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { IScriptExit, ScriptRef } from 'src/app/core/models';
import { StatusService } from 'src/app/core/services';
import { Terminal } from 'xterm';

@Directive({
  selector: '[pruScriptLogWriter]'
})
export class ScriptLogWriterDirective implements AfterViewInit, OnDestroy {

  @Input() public set scriptRef(value: ScriptRef) {
    this.unsubscribeAll();

    this._scriptRef = value;

    console.log('UPDATED');
    if (this._scriptRef) {
      this._dataSubscription = this._scriptRef.data.subscribe(data => {
        this._terminal.write(data);
        console.log(data);
      });
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
  private _dataSubscription: Subscription;
  private _exitSubscription: Subscription;
  private _terminal: Terminal;

  constructor(
    private _element: ElementRef,
    private _statusService: StatusService
  ) { }

  public ngAfterViewInit(): void {
    this._terminal = new Terminal();
    setTimeout(() => {
      this._terminal.open(this._element.nativeElement);
    }, 1);
  }

  public ngOnDestroy(): void {
    this.unsubscribeAll();
  }

  private unsubscribeAll(): void {
    if (this._dataSubscription) {
      this._dataSubscription.unsubscribe();
    }

    if (this._exitSubscription) {
      this._dataSubscription.unsubscribe();
    }
  }

  private scrollToBottom(): void {

    // SourceRef: https://stackoverflow.com/questions/35232731/angular-2-scroll-to-bottom-chat-style
    try {
        this._element.nativeElement.scrollTop = this._element.nativeElement.scrollHeight;
    } catch (err) { }
  }
}
