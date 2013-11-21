define([
  '../../../../api',
  '../../../../api/command-patch',
  '../../../../api/selection'
], function (
  api
) {

  /**
   * Prevent Chrome from inserting BLOCKQUOTEs inside of Ps, and also from
   * adding a redundant `style` attribute to the created BLOCKQUOTE.
   */

  'use strict';

  var INVISIBLE_CHAR = '\uFEFF';

  return function () {
    return function (editor) {
      var indentCommand = new api.CommandPatch('indent');

      indentCommand.execute = function (value) {
        /**
         * Chrome: If we apply the indent command on an empty P, the
         * BLOCKQUOTE will be nested inside the P.
         * As per: http://jsbin.com/oDOriyU/3/edit?html,js,output
         */
        var selection = new api.Selection();
        var range = selection.range;

        if (range.commonAncestorContainer.nodeName === 'P') {
          var textNode = document.createTextNode(INVISIBLE_CHAR);

          range.insertNode(textNode);

          range.setStart(textNode, 0);
          range.setEnd(textNode, 0);

          selection.selection.removeAllRanges();
          selection.selection.addRange(range);
        }

        api.CommandPatch.prototype.execute.call(this, value);

        /**
         * Chrome: The BLOCKQUOTE created contains a redundant style attribute.
         * As per: http://jsbin.com/AkasOzu/1/edit?html,js,output
         */

        // Renew the selection
        selection = new api.Selection();
        var blockquoteNode = selection.getContaining(function (node) {
          return node.nodeName === 'BLOCKQUOTE';
        });
        blockquoteNode.removeAttribute('style');

        editor.pushHistory();
        editor.trigger('content-changed');
      };

      editor.patchedCommands.indent = indentCommand;
    };
  };

});
